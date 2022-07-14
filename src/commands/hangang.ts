import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";
import { CommandInteraction } from "discord.js";
import { Bot, Command, Embed } from "../types";

module.exports = new Command(
  new SlashCommandBuilder().setName("한강").setDescription("한강 수온을 확인합니다."),
  async (interaction: CommandInteraction, bot: Bot) => {
    try {
      const response = await axios("http://hangang.dkserver.wo.tc");
      await interaction.editReply(
        Embed({
          color: "#0067a3",
          icon: "ocean",
          title: "현재 한강 수온",
          description: `\`${response.data.temp}℃\`\n\n자살 예방 핫라인 :telephone: 1577-0199\n희망의 전화 :telephone: 129`,
        })
      );
    } catch (err) {
      await interaction.editReply(
        Embed({
          color: "#ff0000",
          icon: "warning",
          title: "오류",
          description: "수온 정보를 받아오지 못했습니다. 다음에 다시 시도하세요.",
        })
      );
    }
  }
);
