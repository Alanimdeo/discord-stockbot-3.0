"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("deploy").setDescription("설치"), async (message, bot) => {
    const guildCommands = [];
    await Promise.all(bot.commands.map((command) => guildCommands.push(command.data.toJSON())));
    await message.guild?.commands.set(guildCommands);
    await message.reply(`Complete! Commands(${guildCommands.length}): ` +
        guildCommands
            .map((command) => command.name)
            .toString()
            .replace(/,/g, ", "));
});
