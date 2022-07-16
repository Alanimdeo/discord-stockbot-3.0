import { Message } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot, Command } from "../types";
import { getUserdata, verifyUser } from "../modules/database";

module.exports = new Command(
  new SlashCommandBuilder().setName("eval").setDescription("명령 실행"),
  async (message: Message, bot: Bot) => {
    try {
      const database = {
        getUserdata,
        verifyUser,
      };
      const command = message.content.split(" ");
      command.shift();
      command.shift();
      let result = await eval(`(async () => {${command.join(" ")}})()`);
      console.log(result);
      if (typeof result === "object") result = JSON.stringify(result, undefined, 2);
      message.reply("```" + String(result) + "```");
    } catch (err) {
      message.reply("```" + String(err) + "```");
      console.error(err);
    }
  }
);
