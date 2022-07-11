import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { createUser } from "../modules/database";
import { Bot, Command, Embed } from "../types";

module.exports = new Command(
  new SlashCommandBuilder().setName("가입").setDescription("주식 서버에 가입합니다. 최초 1회만 필요합니다."),
  async (interaction: CommandInteraction, bot: Bot) => {
    try {
      await createUser(interaction.user.id);
      await interaction.editReply(
        Embed({
          color: "#008000",
          icon: "white_check_mark",
          title: "가입 완료",
          description: "가입이 완료되었습니다.",
        })
      );
    } catch (err) {
      await interaction.editReply(
        Embed({
          color: "#ff0000",
          icon: "warning",
          title: "오류",
          description: "이미 주식 서버에 가입되어 있습니다.",
        })
      );
    }
  }
);
