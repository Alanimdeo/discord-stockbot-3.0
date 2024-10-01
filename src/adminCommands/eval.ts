import { Message } from "discord.js";
import { getUserdata, verifyUser } from "../modules/database";
import { AdminCommand, Bot } from "../types";

module.exports = new AdminCommand(
  { name: "명령 실행", command: "eval" },
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
      if (typeof result === "object")
        result = JSON.stringify(result, undefined, 2);
      message.reply("```" + String(result) + "```");
    } catch (err) {
      message.reply("```" + String(err) + "```");
      console.error(err);
    }
  }
);
