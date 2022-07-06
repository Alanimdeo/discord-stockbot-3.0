import { ApplicationCommandDataResolvable, Message } from "discord.js";
import { Bot } from "../types";

module.exports = {
  data: {
    name: "deploy",
    description: "설치",
  },
  async execute(message: Message, bot: Bot) {
    const guildCommands: ApplicationCommandDataResolvable[] = [];
    await Promise.all(bot.commands.map((command) => guildCommands.push(command.data.toJSON())));
    await message.guild?.commands.set(guildCommands);
    console.log(message.guild?.commands);
    await message.reply(
      `Complete! Commands(${guildCommands.length}): ` +
        guildCommands
          .map((command) => command.name)
          .toString()
          .replace(/,/g, ", ")
    );
  },
};
