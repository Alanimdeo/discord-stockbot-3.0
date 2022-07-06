"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    data: {
        name: "deploy",
        description: "설치",
    },
    async execute(message, bot) {
        const guildCommands = [];
        await Promise.all(bot.commands.map((command) => guildCommands.push(command.data.toJSON())));
        await message.guild?.commands.set(guildCommands);
        console.log(message.guild?.commands);
        await message.reply(`Complete! Commands(${guildCommands.length}): ` +
            guildCommands
                .map((command) => command.name)
                .toString()
                .replace(/,/g, ", "));
    },
};
