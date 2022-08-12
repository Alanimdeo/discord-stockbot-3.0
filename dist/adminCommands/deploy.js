"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
module.exports = new types_1.AdminCommand({ name: "설치", command: "deploy" }, async (message, bot) => {
    const guildCommands = [];
    bot.commands.map((command) => guildCommands.push(command.data.toJSON()));
    await message.guild?.commands.set(guildCommands);
    await message.reply(`Complete! Commands(${guildCommands.length}): ` +
        guildCommands
            .map((command) => command.name)
            .toString()
            .replace(/,/g, ", "));
});
