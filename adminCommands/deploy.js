module.exports = {
    data: {
        name: "설치",
        command: "deploy",
    },
    async execute(message, client) {
        const guildCommands = [];
        await client.commands.map((command) => guildCommands.push(command.data.toJSON()));
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
