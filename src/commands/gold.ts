import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { getUserdata } from "../modules/database";
import { getGoldPrice, GoldPriceInfo } from "../modules/gold";
import { Command, Embed, EmbedOption, errorLog } from "../types";

module.exports = new Command(
  new SlashCommandBuilder()
    .setName("금")
    .setDescription("금 관련 명령어")
    .addSubcommand((command) =>
      command.setName("시세").setDescription("금 시세를 확인합니다.")
    )
    .addSubcommand((command) =>
      command
        .setName("확인")
        .setDescription("보유한 금의 개수와 가격을 확인합니다.")
    )
    .addSubcommand((command) =>
      command
        .setName("구매")
        .setDescription("금을 구매합니다.")
        .addIntegerOption((option) =>
          option
            .setName("수량")
            .setDescription(
              "수량을 입력하세요. 0을 입력할 시 구매할 수 있는 수량 전체를 구매합니다."
            )
            .setMinValue(0)
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("판매")
        .setDescription("금을 판매합니다.")
        .addIntegerOption((option) =>
          option
            .setName("수량")
            .setDescription(
              "수량을 입력하세요. 0을 입력할 시 판매할 수 있는 수량 전체를 판매합니다."
            )
            .setMinValue(0)
            .setRequired(true)
        )
    ),
  async (interaction: ChatInputCommandInteraction) => {
    return await eval(
      `(async () => {${interaction.options.getSubcommand()}(interaction)})()`
    );
  }
);

async function 시세(interaction: ChatInputCommandInteraction) {
  const price = await getGoldPrice();
  let buyPriceDiff: string = price.buy.diff;
  if (buyPriceDiff === "0") {
    buyPriceDiff = `=`;
  } else if (Number(buyPriceDiff) > 0) {
    buyPriceDiff = `+${Number(buyPriceDiff).toLocaleString("ko-KR")}`;
  } else {
    buyPriceDiff = Number(buyPriceDiff).toLocaleString("ko-KR");
  }
  let sellPriceDiff: string = price.sell.diff;
  if (sellPriceDiff === "0") {
    sellPriceDiff = `=`;
  } else if (Number(sellPriceDiff) > 0) {
    sellPriceDiff = `+${Number(sellPriceDiff).toLocaleString("ko-KR")}`;
  } else {
    sellPriceDiff = Number(sellPriceDiff).toLocaleString("ko-KR");
  }
  await interaction.editReply(
    Embed({
      color: "#ffff00",
      icon: "coin",
      title: "금 시세",
      description: `살 때: \`${price.buy.price.toLocaleString(
        "ko-KR"
      )}원[${buyPriceDiff}]\`\n팔 때: \`${price.sell.price.toLocaleString("ko-KR")}원[${sellPriceDiff}]\``,
      footer: { text: `최근 갱신: ${price.buy.time}` },
    })
  );
}

async function 확인(interaction: ChatInputCommandInteraction) {
  try {
    const userdata = await getUserdata(interaction.user.id);
    let gold: GoldPriceInfo | null = null;
    let diff = "0원 (=)";
    if (userdata.gold.amount > 0) {
      gold = await getGoldPrice();
      if (gold.sell.price !== userdata.gold.buyPrice) {
        const prefix = gold.sell.price > userdata.gold.buyPrice ? "+" : "";
        diff = `${prefix}${(gold.sell.price - userdata.gold.buyPrice).toLocaleString("ko-KR")}원 (${prefix}${
          Math.round(
            (userdata.gold.buyPrice / userdata.gold.amount / gold.sell.price -
              1) *
              10000 +
              Number.EPSILON
          ) / 100
        }%)`;
      }
    }
    await interaction.editReply(
      Embed({
        color: "#ffff00",
        icon: "coin",
        title: `${(interaction.member as GuildMember).displayName} 님의 금 보유 현황`,
        description: `수량: \`${userdata.gold.amount.toLocaleString("ko-KR")}원\`\n평균 구매가: : \`${(
          Math.round(
            (userdata.gold.buyPrice / userdata.gold.amount + Number.EPSILON) *
              100
          ) / 100
        ).toLocaleString("ko-KR")}원\`\n수익: \`${diff}\``,
      })
    );
  } catch (err) {
    await interaction.editReply(Embed(handleError(err)));
  }
}

async function 구매(interaction: ChatInputCommandInteraction) {
  try {
    const userdata = await getUserdata(interaction.user.id);
    const gold = await getGoldPrice();
    let amount = interaction.options.getInteger("수량", true);
    if (amount < 1) {
      amount = Math.floor(userdata.money.amount / gold.buy.price);
    }
    if (amount < 1 || userdata.money.amount < gold.buy.price * amount) {
      await interaction.editReply(
        Embed({
          color: "#ff0000",
          icon: "warning",
          title: "구매 실패",
          description: "돈이 부족합니다.",
        })
      );
      return;
    }
    await userdata.money.reduceMoney(gold.buy.price * amount);
    await userdata.gold.addGold(amount, gold.buy.price);
    await interaction.editReply(
      Embed({
        color: "#008000",
        icon: "white_check_mark",
        title: "구매 완료",
        description: `금 ${amount}개를 구매했습니다.\n구매 금액: \`${gold.buy.price.toLocaleString(
          "ko-KR"
        )} × ${amount.toLocaleString("ko-KR")} = ${(
          gold.buy.price * amount
        ).toLocaleString(
          "ko-KR"
        )}원\`\n보유 중인 금: \`${userdata.gold.amount.toLocaleString(
          "ko-KR"
        )}개\`\n남은 돈: \`${userdata.money.amount.toLocaleString("ko-KR")}원\``,
      })
    );
  } catch (err) {
    await interaction.editReply(Embed(handleError(err)));
  }
}

async function 판매(interaction: ChatInputCommandInteraction) {
  try {
    const userdata = await getUserdata(interaction.user.id);
    let amount = interaction.options.getInteger("수량", true);
    if (amount < 1) {
      amount = userdata.gold.amount;
    }
    if (amount < 1) {
      await interaction.editReply(
        Embed({
          color: "#ff0000",
          icon: "warning",
          title: "판매 실패",
          description: "0개는 판매할 수 없습니다.",
        })
      );
      return;
    }
    const gold = await getGoldPrice();
    await userdata.money.addMoney(gold.sell.price * amount);
    await userdata.gold.reduceGold(amount, gold.sell.price);
    await interaction.editReply(
      Embed({
        color: "#008000",
        icon: "white_check_mark",
        title: "판매 완료",
        description: `금 ${amount}개를 판매했습니다.\n판매 금액: \`${gold.sell.price.toLocaleString(
          "ko-KR"
        )} × ${amount.toLocaleString("ko-KR")} = ${(
          gold.sell.price * amount
        ).toLocaleString(
          "ko-KR"
        )}원\`\n보유 중인 금: \`${userdata.gold.amount.toLocaleString(
          "ko-KR"
        )}개\`\n남은 돈: \`${userdata.money.amount.toLocaleString("ko-KR")}원\``,
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
      case "NotEnoughGold":
        option.title = "금 부족";
        option.description = "가진 금이 부족합니다.";
        break;
      case "GoldFetchFailed":
        option.title = "금 시세 조회 실패";
        option.description =
          "금 시세 조회에 실패했습니다. 일시적 오류일 수 있으니 잠시 후 다시 시도하세요.";
    }
  } else {
    errorLog(err, "commands/gold");
    console.error(err);
  }
  return option;
}
