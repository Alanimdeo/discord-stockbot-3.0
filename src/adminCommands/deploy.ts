import { ApplicationCommandDataResolvable, Message } from "discord.js";
import { AdminCommand, Bot } from "../types";

module.exports = new AdminCommand({ name: "설치", command: "deploy" }, async (message: Message, bot: Bot) => {
  const guildCommands: ApplicationCommandDataResolvable[] = [];
  await Promise.all(bot.commands.map((command) => guildCommands.push(command.data.toJSON())));
  await message.guild?.commands.set(guildCommands);
  await message.reply(
    `Complete! Commands(${guildCommands.length}): ` +
      guildCommands
        .map((command) => command.name)
        .toString()
        .replace(/,/g, ", ")
  );
});
