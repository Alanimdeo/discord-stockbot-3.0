import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { getUserdata, verifyUser } from "../modules/database";
import { getGoldPrice } from "../modules/gold";
import { getStockInfo } from "../modules/stock";
import { Bot, Command, Embed, EmbedOption, errorLog } from "../types";

module.exports = new Command(
  new SlashCommandBuilder()
    .setName("돈")
    .setDescription("돈 관련 명령어")
    .addSubcommand((command) => command.setName("확인").setDescription("가진 돈과 자산을 확인합니다."))
    .addSubcommand((command) =>
      command
        .setName("송금")
        .setDescription("돈을 다른 사람에게 보냅니다.")
        .addUserOption((option) =>
          option.setName("대상").setDescription("돈을 받을 사람을 입력하세요.").setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName("금액").setDescription("보낼 금액을 입력하세요.").setRequired(true)
        )
    ),
  async (interaction: CommandInteraction, bot: Bot) => {
    return await eval(`${interaction.options.getSubcommand()}(interaction, bot)`);
  }
);

async function 확인(interaction: CommandInteraction, bot: Bot) {
  try {
    const userdata = await getUserdata(interaction.user.id);
    let stockMoney = 0;
    await Promise.all(
      Object.keys(userdata.stock.status).map(async (key) => {
        const { price } = await getStockInfo(key, bot.corpList);
        stockMoney += price * userdata.stock.status[key].amount;
      })
    );
    let goldMoney = (await getGoldPrice()).sell.price * userdata.gold.amount;
    await interaction.editReply(
      Embed({
        color: "#ffff00",
        icon: "moneybag",
        title: `${(interaction.member as GuildMember).displayName}님의 자산`,
        description: `현금: \`${userdata.money.amount.toLocaleString("ko-KR")}원\`\n주식: \`${stockMoney.toLocaleString(
          "ko-KR"
        )}원\`\n금: \`${goldMoney.toLocaleString("ko-KR")}원\`\n총액: \`${(
          userdata.money.amount +
          stockMoney +
          goldMoney
        ).toLocaleString("ko-KR")}원\``,
      })
    );
  } catch (err) {
    await interaction.editReply(Embed(handleError(err)));
  }
}

async function 송금(interaction: CommandInteraction, bot: Bot) {
  try {
    const target = interaction.options.getUser("대상")!;
    if (!(await verifyUser(target.id))) {
      return await interaction.editReply(
        Embed({
          color: "#ff0000",
          icon: "warning",
          title: "오류",
          description: "받을 상대가 가입되어 있지 않습니다.",
        })
      );
    }
    const targetUserdata = await getUserdata(target.id);
    const amount = interaction.options.getInteger("금액")!;
    if (amount < 1) {
      return await interaction.editReply(
        Embed({
          color: "#ff0000",
          icon: "warning",
          title: "오류",
          description: "1원 미만은 송금할 수 없습니다.",
        })
      );
    }
    const userdata = await getUserdata(interaction.user.id);
    if (userdata.money.amount < amount) {
      await interaction.editReply(
        Embed({
          color: "#ff0000",
          icon: "warning",
          title: "오류",
          description: "가진 돈이 부족합니다.",
        })
      );
    }
    await userdata.money.reduceMoney(amount);
    await targetUserdata.money.addMoney(amount);
    await interaction.editReply(
      Embed({
        color: "#008000",
        icon: "white_check_mark",
        title: `송금 완료`,
        description: `\`${amount.toLocaleString("ko-KR")}원\`을 <@${
          target.id
        }>님에게 송금했습니다.\n송금 후 잔액: \`${userdata.money.amount.toLocaleString("ko-KR")}원\``,
      })
    );
  } catch (err) {
    await interaction.editReply(Embed(handleError(err)));
  }
}

function handleError(err: unknown) {
  const option: EmbedOption = {
    color: "#ff0000",
    icon: "warning",
    title: "알 수 없는 오류",
    description: "알 수 없는 오류가 발생했습니다. 개발자에게 문의하세요.",
  };
  if (err instanceof Error) {
    switch (err.name) {
      case "StockFetchFailed":
        option.title = "주식 정보 읽기 실패";
        option.description = "주식 정보를 읽어오는 데 실패했습니다. 서버 문제일 수 있으니 나중에 다시 시도해 보세요.";
        break;
      default:
        errorLog(err, "commands/money");
        console.error(err);
    }
  } else {
    errorLog(err, "commands/money");
    console.error(err);
  }
  return option;
}
