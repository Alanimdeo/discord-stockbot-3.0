module.exports = {
    data: {
        name: "설치",
        command: "deploy",
    },
    async execute(message, commands) {
        const guildCommands = [];
        await commands.map((command) => {
            guildCommands.push(command.data);
        });
        await message.guild.commands.set(guildCommands);
        await message.reply(
            `Complete! Commands(${guildCommands.length}): ` +
                guildCommands
                    .map((command) => command.name)
                    .toString()
                    .replace(/,/g, ", ")
        );
    },
};
