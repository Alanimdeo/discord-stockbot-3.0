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
                )
                .setFooter(`최근 갱신: ${buyPrice.x}`),
        ],
    });
}

async function 확인(interaction, buyPrice, sellPrice) {
    database.query(`SELECT gold FROM users WHERE id = ${interaction.member.id}`, async (err, result) => {
        if (err) console.error(err);
        result = JSON.parse(result[0].gold);
        console.log(result);
        if (result.amount == 0)
            return await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("#ff0000")
                        .setTitle(":warning: 오류")
                        .setDescription("보유한 금이 없습니다."),
                ],
            });
        else {
            buyPrice = buyPrice.y;
            var price = buyPrice * result.amount;
            var difference = [
                price - result.buyPrice,
                ((price - result.buyPrice) / result.buyPrice / result.amount) * 100,
            ];
            return await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("#ffff00")
                        .setTitle(`:coin: ${interaction.member.displayName} 님의 금 보유 현황`)
                        .setDescription(
                            `수량: \`${result.amount.toLocaleString("ko-KR")}개\`\n평균 구매가: \`${(
                                result.buyPrice / result.amount
                            ).toLocaleString("ko-KR")}원\`\n수익: \`${
                                (difference[0] > 0 ? "+" : "") + difference[0].toLocaleString("ko-KR")
                            }원 (${
                                (difference[0] > 0 ? "+" : "") +
                                (Math.floor(difference[1] * 100) / 100).toLocaleString("ko-KR")
                            }%)\``
                        )
                        .setFooter(`최근 갱신: ${sellPrice.x}\n수익은 구매가 기준입니다.`),
                ],
            });
        }
    });
}

async function 구매(interaction, buyPrice, sellPrice) {
    var amount = interaction.options.getInteger("수량");
    if (amount < 1)
        return await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle(":warning: 오류")
                    .setDescription("1개 미만은 구매할 수 없습니다."),
            ],
        });
    database.query(`SELECT money, gold FROM users WHERE id = ${interaction.member.id}`, async (err, result) => {
        if (err) return console.error(err);
        var money = result[0].money;
        var gold = JSON.parse(result[0].gold);
        buyPrice = buyPrice.y;
        if (buyPrice * amount > money)
            return await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("#ff0000")
                        .setTitle(":warning: 오류")
                        .setDescription("돈이 부족합니다."),
                ],
            });
        money -= buyPrice * amount;
        gold.amount += amount;
        gold.buyPrice += buyPrice * amount;
        database.query(
            `UPDATE users SET money = ${money}, gold = '${JSON.stringify(gold)}' WHERE id = ${interaction.member.id}`,
            async (err) => {
                if (err) return console.error(err);
                return await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setColor("#008000")
                            .setTitle(":white_check_mark: 구매 완료")
                            .setDescription(
                                `금을 구매했습니다.\n구매 금액: \`${buyPrice.toLocaleString(
                                    "ko-KR"
                                )} × ${amount.toLocaleString("ko-KR")} = ${(buyPrice * amount).toLocaleString(
                                    "ko-KR"
                                )}원\`\n보유 중인 금: \`${gold.amount.toLocaleString(
                                    "ko-KR"
                                )}개\`\n남은 돈: \`${money.toLocaleString("ko-KR")}원\``
                            ),
                    ],
                });
            }
        );
    });
}

async function 판매(interaction, buyPrice, sellPrice) {
    var amount = interaction.options.getInteger("수량");
    if (amount < 1)
        return await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle(":warning: 오류")
                    .setDescription("1개 미만은 판매할 수 없습니다."),
            ],
        });
    database.query(`SELECT money, gold FROM users WHERE id = ${interaction.member.id}`, async (err, result) => {
        if (err) return console.error(err);
        var money = result[0].money;
        var gold = JSON.parse(result[0].gold);
        sellPrice = sellPrice.y;
        if (amount > gold.amount)
            return await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("#ff0000")
                        .setTitle(":warning: 오류")
                        .setDescription("가진 것보다 많이 판매할 수 없습니다."),
                ],
            });
        money -= sellPrice * amount;
        gold.amount -= amount;
        if (gold.amount == 0) gold.buyPrice = 0;
        else gold.buyPrice -= sellPrice * amount;
        database.query(
            `UPDATE users SET money = ${money}, gold = '${JSON.stringify(gold)}' WHERE id = ${interaction.member.id}`,
            async (err) => {
                if (err) return console.error(err);
                return await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setColor("#008000")
                            .setTitle(":white_check_mark: 판매 완료")
                            .setDescription(
                                `금을 판매했습니다.\n판매 금액: \`${sellPrice.toLocaleString(
                                    "ko-KR"
                                )} × ${amount.toLocaleString("ko-KR")} = ${(sellPrice * amount).toLocaleString(
                                    "ko-KR"
                                )}원\`\n남은 금: \`${gold.amount.toLocaleString(
                                    "ko-KR"
                                )}개\`\n남은 돈: \`${money.toLocaleString("ko-KR")}원\``
                            ),
                    ],
                });
            }
        );
    });
}
