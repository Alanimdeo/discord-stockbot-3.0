const mysql = require('mysql');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const config = require('../config.json');
const database = mysql.createConnection(config.mysql);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('가입')
        .setDescription('주식 서버에 가입합니다. 최초 1회만 필요합니다.')
    ,
    async execute(interaction) {
        database.query(`SELECT * FROM users WHERE id = ${interaction.member.id}`, async (err, result) => {
			if (err) console.error(err);
			console.log(result);
			if (result.length > 0) {
				await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription('이미 가입되어 있습니다.')] });
			} else {
                database.query(`INSERT INTO users (id, money, stock, lottery, lastClaim) VALUES (${interaction.member.id}, 1000000, JSON_OBJECT(), JSON_OBJECT(), NOW())`, async err => {
                    if (err) console.error(err);
                    await interaction.reply({ embeds: [new MessageEmbed().setColor('#008000').setTitle(':white_check_mark: 가입 완료').setDescription('가입이 완료되었습니다.')] });
                });
			}
		});
    }
}