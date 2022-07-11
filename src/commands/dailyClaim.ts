import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getUserdata } from "../modules/database";
import { isToday, toDateString } from "../modules/time";
import { Bot, Command, Embed } from "../types";

module.exports = new Command(
  new SlashCommandBuilder().setName("용돈").setDescription("용돈을 받습니다. 하루에 1회 받을 수 있습니다."),
  async (interaction: CommandInteraction, bot: Bot) => {
    const user = await getUserdata(interaction.user.id);
    if (isToday(new Date(user.lastClaim))) {
      return await interaction.editReply(
        Embed({
          color: "#ff0000",
          icon: "warning",
          title: "오류",
          description: "오늘 용돈을 이미 받았습니다. 내일 다시 시도하세요.",
        })
      );
    }
    const claimedMoney = Math.floor(Math.random() * 130 + 20) * 100;
    await user.money.addMoney(claimedMoney);
    await user.update([{ key: "lastClaim", value: toDateString() }]);
    await interaction.editReply(
      Embed({
        color: "#008000",
        icon: "money_with_wings",
        title: "오늘의 용돈",
        description: `오늘 용돈으로 \`${claimedMoney.toLocaleString(
          "ko-KR"
        )}원\`을 받았습니다.\n현재 가진 돈: \`${user.money.amount.toLocaleString("ko-KR")}원\``,
      })
    );
  }
);
