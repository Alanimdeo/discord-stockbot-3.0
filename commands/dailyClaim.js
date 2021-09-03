const mysql = require('mysql');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const config = require('../config.json');
const database = mysql.createConnection(config.mysql);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('용돈')
        .setDescription('용돈을 받습니다. 하루에 1회 받을 수 있습니다.')
    ,
    async execute(interaction) {
        database.query(`SELECT money, lastClaim FROM users WHERE id = ${interaction.member.id}`, async (err, result) => {
            if (err) console.error(err);
            result = result[0];
            var lastClaim = result.lastClaim.split('-');
            var now = new Date();
            if (Number(lastClaim[0]) == now.getFullYear() && Number(lastClaim[1]) == now.getMonth() + 1 && Number(lastClaim[2]) == now.getDate()) {
                await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription('오늘 용돈을 이미 받으셨습니다. 내일 다시 시도하세요.')] });
            } else {
                var claimedMoney = Math.floor((Math.random() * 30) + 20) * 100;
                database.query(`UPDATE users SET money = ${result.money + claimedMoney}, lastClaim = '${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}' WHERE id = ${interaction.member.id}`, async err => {
                    if (err) console.error(err);
                    await interaction.reply({ embeds: [new MessageEmbed().setColor('#008000').setTitle(':money_with_wings: 오늘의 용돈').setDescription(`오늘 용돈으로 \`${claimedMoney.toLocaleString('ko-KR')}원\`을 받았습니다.\n현재 잔액: \`${(result.money + claimedMoney).toLocaleString('ko-KR')}원\``)] });
                });
            }
        });
    }
};