const axios = require("axios");
const mysql = require("mysql");
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const config = require("../config.json");
const database = mysql.createConnection(config.mysql);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("금")
        .setDescription("금 관련 명령어")
        .addSubcommand((option) => option.setName("가격").setDescription("금 가격을 확인합니다."))
        .addSubcommand((option) => option.setName("확인").setDescription("보유한 금의 개수를 확인합니다."))
        .addSubcommand((option) =>
            option
                .setName("구매")
                .setDescription("금을 구매합니다.")
                .addIntegerOption((option) =>
                    option.setName("수량").setDescription("수량을 입력하세요.").setRequired(true)
                )
        )
        .addSubcommand((option) =>
            option
                .setName("판매")
                .setDescription("금을 판매합니다.")
                .addIntegerOption((option) =>
                    option.setName("수량").setDescription("수량을 입력하세요.").setRequired(true)
                )
        ),
    async execute(interaction) {
        await interaction.deferReply();
        var gold = await axios.post("https://apiserver.koreagoldx.co.kr/api/price/chart/listByDate", {
            srchDt: "1M",
            type: "Au",
        });
        eval(`${interaction.options.getSubcommand()}(interaction, gold.data.sChartList[0], gold.data.pChartList[0])`);
    },
};

async function 가격(interaction, buyPrice, sellPrice) {
    return await interaction.editReply({
        embeds: [
            new MessageEmbed()
                .setColor("#ffff00")
                .setTitle(`:coin: 현재 금 시세`)
                .setDescription(
                    `살 때: \`${buyPrice.y.toLocaleString("ko-KR")}원\`[${
                        buyPrice.t == 0
                            ? "="
                            : "전일 대비 " +
                              buyPrice.t.substr(0, 1) +
                              Number(buyPrice.t.substr(1, buyPrice.t.length - 1)).toLocaleString("ko-KR") +
                              "원, " +
                              Math.round((Number(buyPrice.t) / buyPrice.y) * 10000) / 100 +
                              "%"
                    }]\n팔 때: \`${sellPrice.y.toLocaleString("ko-KR")}원\`[${
                        sellPrice.t == 0
                            ? "="
                            : "전일 대비 " +
                              sellPrice.t.substr(0, 1) +
                              Number(sellPrice.t.substr(1, sellPrice.t.length - 1)).toLocaleString("ko-KR") +
                              "원, " +
                              Math.round((Number(sellPrice.t) / sellPrice.y) * 10000) / 100 +
                              "%"
                    }]`
                ),
        ],
    });
}

async function 확인(interaction, buyPrice, sellPrice) {
    database.query(`SELECT gold FROM users WHERE id = ${interaction.member.id}`, async (err, result) => {
        if (err) console.error(err);
        result = result[0];
        if (result.amount == 0)
            return await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("#ff0000")
                        .setTitle(":warning: 오류")
                        .setDescription("보유한 금이 없습니다."),
                ],
            });
        else
            return await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("#ffff00")
                        .setTitle(`:coin: ${interaction.member.displayName} 님의 금 보유 현황`)
                        .setDescription(
                            `수량: \`${result.amount.toLocaleString("ko-KR")}개\`\n(평균 구매가 ${(
                                result.buyPrice / result.amount
                            ).toLocaleString("ko-KR")}원)[]`
                        ),
                ],
            });
    });
}
