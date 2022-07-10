import { SlashCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandDataResolvable, Message } from "discord.js";
import { Bot, Command } from "../types";

module.exports = new Command(
  new SlashCommandBuilder().setName("deploy").setDescription("설치"),
  async (message: Message, bot: Bot) => {
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
  }
);
