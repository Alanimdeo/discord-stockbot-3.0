const axios = require("axios");
const mysql = require("mysql");
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const config = require("../config.json");
const database = mysql.createConnection(config.mysql);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("홀짝")
        .setDescription("홀과 짝 중 하나를 선택하여 맞출 경우 건 돈의 1.2배를 획득합니다.")
        .addStringOption((option) =>
            option
                .setName("홀짝")
                .setDescription("홀 또는 짝을 선택하세요.")
                .setRequired(true)
                .addChoice("홀", "odd")
                .addChoice("짝", "even")
        )
        .addIntegerOption((option) =>
            option.setName("금액").setDescription("베팅할 금액을 입력하세요.").setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const random = Math.random() >= 0.5 ? "odd" : "even";
        if (interaction.options.getInteger("금액") < 1)
            return await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("#ff0000")
                        .setTitle(":warning: 오류")
                        .setDescription("1원 미만은 베팅할 수 없습니다."),
                ],
            });
        database.query(`SELECT money FROM users WHERE id = ${interaction.member.id}`, async (err, result) => {
            if (err) return console.error(err);
            let money = result[0].money;
            if (money < interaction.options.getInteger("금액"))
                return await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setColor("#ff0000")
                            .setTitle(":warning: 오류")
                            .setDescription("가진 돈보다 많이 베팅할 수 없습니다."),
                    ],
                });
            let success = interaction.options.getString("홀짝") === random;
            money += success ? interaction.options.getInteger("금액") * 0.2 : -interaction.options.getInteger("금액");
            database.query(`UPDATE users SET money = ${money} WHERE id = ${interaction.member.id}`, async (err) => {
                if (err) return console.error(err);
                return await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setColor("#ffff00")
                            .setTitle(
                                `:${success ? "tada" : "disappointed_relieved"}: 결과: ${
                                    random === "odd" ? "홀" : "짝"
                                }`
                            )
                            .setDescription(
                                `도박에 ${success ? "성공" : "실패"}하여 ${
                                    success
                                        ? interaction.options.getInteger("금액") * 0.2
                                        : interaction.options.getInteger("금액")
                                }원을 ${success ? "얻었" : "잃었"}습니다.\n남은 돈: \`${money.toLocaleString(
                                    "ko-KR"
                                )}원\``
                            ),
                    ],
                });
            });
        });
    },
};
