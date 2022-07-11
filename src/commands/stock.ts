import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { getUserdata } from "../modules/database";
import { getStockInfo } from "../modules/stock";
import { Bot, Command, Embed, EmbedOption, errorLog } from "../types";

module.exports = new Command(
  new SlashCommandBuilder()
    .setName("주식")
    .setDescription("주식 관련 명령어")
    .addSubcommand((command) =>
      command
        .setName("확인")
        .setDescription("주식 가격을 확인합니다.")
        .addStringOption((option) =>
          option.setName("회사명").setDescription("회사명 또는 종목코드를 입력하세요.").setRequired(true)
        )
    )
    .addSubcommand((command) => command.setName("내주식").setDescription("보유한 주식의 상태를 확인합니다."))
    .addSubcommand((command) =>
      command
        .setName("구매")
        .setDescription("주식을 구매합니다.")
        .addStringOption((option) =>
          option.setName("회사명").setDescription("회사명 또는 종목코드를 입력하세요.").setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("수량")
            .setDescription("수량을 입력하세요. 0 이하의 값을 입력할 시 구매할 수 있는 수량 전체를 구매합니다.")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("판매")
        .setDescription("주식을 판매합니다.")
        .addStringOption((option) =>
          option.setName("회사명").setDescription("회사명 또는 종목코드를 입력하세요.").setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("수량")
            .setDescription("수량을 입력하세요. 0 이하의 값을 입력할 시 판매할 수 있는 수량 전체를 판매합니다.")
            .setRequired(true)
        )
    ),
  async (interaction: CommandInteraction, bot: Bot) => {
    return await eval(`${interaction.options.getSubcommand()}(interaction, bot)`);
  }
);

async function 확인(interaction: CommandInteraction, bot: Bot) {
  try {
    const stockInfo = await getStockInfo(interaction.options.getString("회사명")!, bot.corpList);
    await interaction.editReply(
      Embed({
        color: "#0090ff",
        icon: "chart_with_upwards_trend",
        title: `${stockInfo.name}(${stockInfo.code})의 현재 주가`,
        description: `\`${stockInfo.price.toLocaleString("ko-KR")}원\``,
        image: `https://ssl.pstatic.net/imgfinance/chart/item/area/day/${stockInfo.code}.png`,
      })
    );
  } catch (err) {
    await interaction.editReply(Embed(handleError(err)));
  }
}

async function 내주식(interaction: CommandInteraction, bot: Bot) {
  try {
    const userdata = await getUserdata(interaction.user.id);
    if (Object.keys(userdata.stock.status).length === 0) {
      return await interaction.editReply(
        Embed({
          color: "#ff0000",
          icon: "warning",
          title: "오류",
          description: "보유한 주식이 없습니다.",
        })
      );
    }
    let reply = `:information_source: ${(interaction.member as GuildMember).displayName} 님의 주식 상태입니다.\n`;
    const codes = Object.keys(userdata.stock.status);
    codes.sort();
    for (const code of codes) {
      const userStock = userdata.stock.status[code];
      const stockInfo = await getStockInfo(code, bot.corpList);
      const currentPrice = stockInfo.price * userStock.amount;
      const avgPrice = userStock.buyPrice / userStock.amount;
      const plusMinus = currentPrice > userStock.buyPrice ? "+" : currentPrice === userStock.buyPrice ? "=" : "";
      const prefix = stockInfo.price > avgPrice ? "diff\n-" : stockInfo.price === avgPrice ? "\n*" : "yaml\n=";
      const benefit = `${plusMinus}${
        Math.round(((stockInfo.price / avgPrice) * 100 - 100 + Number.EPSILON) * 100) / 100
      }%, ${plusMinus}${(currentPrice - userStock.buyPrice).toLocaleString("ko-KR")}원`;
      reply += `\`\`\`${prefix} ${stockInfo.name}(${stockInfo.code}): ${
        userStock.amount
      }주, ${currentPrice.toLocaleString("ko-KR")}원 (${
        currentPrice === userStock.buyPrice ? "=" : benefit
      })\n  구매 가격 ${userStock.buyPrice.toLocaleString("ko-KR")}원(평균 ${(
        Math.round((avgPrice + Number.EPSILON) * 100) / 100
      ).toLocaleString("ko-KR")}원), 현재 1주당 ${stockInfo.price.toLocaleString("ko-KR")}원\`\`\``;
    }
    await interaction.editReply(reply);
  } catch (err) {
    await interaction.editReply(Embed(handleError(err)));
  }
}

async function 구매(interaction: CommandInteraction, bot: Bot) {
  try {
    const corpName = interaction.options.getString("회사명")!;
    let amount = interaction.options.getInteger("수량")!;
    const userdata = await getUserdata(interaction.user.id);
    const stockInfo = await getStockInfo(corpName, bot.corpList);
    if (amount < 1) {
      amount = Math.floor(userdata.money.amount / stockInfo.price);
    }
    if (amount < 1 || userdata.money.amount < stockInfo.price * amount) {
      return await interaction.editReply(
        Embed({
          color: "#ff0000",
          icon: "warning",
          title: "오류",
          description: "돈이 부족합니다.",
        })
      );
    }
    await userdata.money.reduceMoney(stockInfo.price * amount);
    await userdata.stock.addStock(stockInfo.code, amount, stockInfo.price);
    await interaction.editReply(
      Embed({
        color: "#008000",
        icon: "white_check_mark",
        title: "주식 구매 완료",
        description: `${stockInfo.name}(${stockInfo.code}) ${amount.toLocaleString(
          "ko-KR"
        )}주를 구매했습니다.\n구매 금액: \`${stockInfo.price.toLocaleString("ko-KR")} × ${amount.toLocaleString(
          "ko-KR"
        )} = ${(stockInfo.price * amount).toLocaleString("ko-KR")}원\`\n보유 중인 주식: \`${userdata.stock.status[
          stockInfo.code
        ].amount.toLocaleString("ko-KR")}주\`\n남은 돈: \`${userdata.money.amount.toLocaleString("ko-KR")}원\``,
      })
    );
  } catch (err) {
    await interaction.editReply(Embed(handleError(err)));
  }
}

async function 판매(interaction: CommandInteraction, bot: Bot) {
  try {
    const corpName = interaction.options.getString("회사명")!;
    let amount = interaction.options.getInteger("수량")!;
    const userdata = await getUserdata(interaction.user.id);
    const stockInfo = await getStockInfo(corpName, bot.corpList);
    if (!userdata.stock.status[stockInfo.code]) {
      return await interaction.editReply(
        Embed({
          color: "#ff0000",
          icon: "warning",
          title: "오류",
          description: "보유한 주식이 없습니다.",
        })
      );
    }
    if (amount < 1 || amount > userdata.stock.status[stockInfo.code].amount) {
      amount = userdata.stock.status[stockInfo.code].amount;
    }
    const fee = Math.round(stockInfo.price * amount * 0.003);
    await userdata.money.addMoney(stockInfo.price * amount - fee);
    await userdata.stock.reduceStock(stockInfo.code, amount, stockInfo.price);
    const noStockRemain = !userdata.stock.status[stockInfo.code];
    await interaction.editReply(
      Embed({
        color: "#008000",
        icon: "white_check_mark",
        title: "주식 판매 완료",
        description: `${stockInfo.name}(${stockInfo.code}) ${amount.toLocaleString(
          "ko-KR"
        )}주를 판매했습니다.\n판매 금액: \`${stockInfo.price.toLocaleString("ko-KR")} × ${amount.toLocaleString(
          "ko-KR"
        )} = ${(stockInfo.price * amount).toLocaleString("ko-KR")}원\`\n세금 및 수수료(0.3%): \`${fee.toLocaleString(
          "ko-KR"
        )}원\`\n실 수령액: \`${(stockInfo.price * amount - fee).toLocaleString("ko-KR")}원\`\n보유 중인 주식: \`${
          noStockRemain ? "0" : userdata.stock.status[stockInfo.code].amount.toLocaleString("ko-KR")
        }주\`\n남은 돈: \`${userdata.money.amount.toLocaleString("ko-KR")}원\``,
      })
    );
  } catch (err) {
    await interaction.editReply(Embed(handleError(err)));
  }
}

function handleError(err: unknown): EmbedOption {
  const option: EmbedOption = {
    color: "#ff0000",
    icon: "warning",
    title: "알 수 없는 오류",
    description: "알 수 없는 오류가 발생했습니다. 개발자에게 문의하세요.",
  };
  if (err instanceof Error) {
    switch (err.message) {
      case "ResultNotFound":
        option.title = "검색 결과 없음";
        option.description = "검색 결과가 없습니다. 회사명 또는 종목코드를 올바르게 입력하였는지 확인하세요.";
        break;
      case "StockFetchFailed":
        option.title = "주식 정보 읽기 실패";
        option.description = "주식 정보를 읽어오는 데 실패했습니다. 서버 문제일 수 있으니 나중에 다시 시도해 보세요.";
        break;
      default:
        errorLog(err, "commands/stock");
        console.error(err);
    }
  } else {
    errorLog(err, "commands/stock");
    console.error(err);
  }
  return option;
}
