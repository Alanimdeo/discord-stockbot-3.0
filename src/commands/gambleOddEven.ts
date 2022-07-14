import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getUserdata } from "../modules/database";
import { checkDailyLimit, dailyLimitExceededEmbed } from "../modules/gamble";
import { Bot, Command, Embed, EmbedOption } from "../types";

module.exports = new Command(
  new SlashCommandBuilder()
    .setName("홀짝")
    .setDescription("홀과 짝 중 하나를 선택하여 맞출 경우 건 돈의 1.5배를 획득합니다.")
    .addStringOption((option) =>
      option
        .setName("홀짝")
        .setDescription("홀 또는 짝을 선택하세요.")
        .addChoices({ name: "홀", value: "odd" }, { name: "짝", value: "even" })
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName("금액").setDescription("베팅할 금액을 입력하세요.").setMinValue(1).setRequired(true)
    ),
  async (interaction: CommandInteraction, bot: Bot) => {
    const userdata = await getUserdata(interaction.user.id);
    if (!(await checkDailyLimit(userdata))) {
      return await interaction.editReply(dailyLimitExceededEmbed);
    }
    const betMoney = interaction.options.getInteger("금액", true);
    if (userdata.money.amount < betMoney) {
      return await interaction.editReply(
        Embed({
          color: "#ff0000",
          icon: "warning",
          title: "오류",
          description: "가진 돈보다 많이 베팅할 수 없습니다.",
        })
      );
    }
    const random = Math.random() >= 0.5 ? "odd" : "even";
    const embedOption: EmbedOption = {
      color: "#ffff00",
      title: `결과: ${random === "odd" ? "홀" : "짝"}`,
      description: "",
    };
    if (random === interaction.options.getString("홀짝", true)) {
      await userdata.money.addMoney(betMoney * 0.5);
      embedOption.icon = "tada";
      embedOption.description = `축하합니다! 도박에 성공하여 \`${(betMoney * 0.5).toLocaleString(
        "ko-KR"
      )}원\`을 얻었습니다.`;
    } else {
      await userdata.money.reduceMoney(betMoney);
      embedOption.icon = "disappointed_relieved";
      embedOption.description = `아쉽습니다. 도박에 실패하여 \`${betMoney.toLocaleString("ko-KR")}원\`을 잃었습니다.`;
    }
    embedOption.description += `\n현재 가진 돈: \`${userdata.money.amount.toLocaleString(
      "ko-KR"
    )}원\`\n오늘 남은 도박 횟수: ${10 - userdata.gamble.count}회`;
    await interaction.editReply(Embed(embedOption));
  }
);
