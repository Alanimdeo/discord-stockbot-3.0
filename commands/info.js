const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder().setName("도움말").setDescription("도움말 페이지를 출력합니다."),
    async execute(interaction) {
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor("#4aa8d8")
                    .setTitle(":information_source: 도움말 확인")
                    .setDescription("자세한 설명은 [이곳](<https://stockbot.alan.imdeo.kr/>)에서 보실 수 있습니다."),
            ],
        });
    },
};
