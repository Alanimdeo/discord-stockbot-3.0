const http = require('http');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('한강')
        .setDescription('한강 수온을 확인합니다.')
    ,
    async execute(interaction) {
        http.get('http://hangang.dkserver.wo.tc', async resp => {
            var data = '';
            resp.on('data', chunk => { data += chunk; });
            resp.on('end', async () => { await interaction.reply({ embeds: [new MessageEmbed().setColor('#0067a3').setTitle(':ocean: 현재 한강 수온').setDescription(`현재 한강의 수온은 \`${JSON.parse(data)['temp']} ℃\` 입니다.\n\n자살 예방 핫라인 :telephone: 1577-0199\n희망의 전화 :telephone: 129`)] }); });
        }).end();
    }
};