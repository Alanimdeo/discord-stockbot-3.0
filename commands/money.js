const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const mysql = require("mysql");

const config = require("../config.json");

const database = mysql.createConnection(config.mysql);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("돈")
        .setDescription("돈 관련 명령어")
        .addSubcommand((option) =>
            option.setName("확인").setDescription("가진 돈을 확인합니다.")
        )
        .addSubcommand((option) =>
            option
                .setName("송금")
                .setDescription("돈을 다른 사람에게 보냅니다.")
                .addUserOption((option) =>
                    option
                        .setName("대상")
                        .setDescription("돈을 받을 사람을 입력하세요.")
                        .setRequired(true)
                )
                .addNumberOption((option) =>
                    option
                        .setName("금액")
                        .setDescription("보낼 급액을 입력하세요.")
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        await eval(`${interaction.options.getSubcommand()}(interaction)`);
    },
};

async function 확인(interaction) {
    database.query(
        `SELECT money, stock FROM users WHERE id = ${interaction.member.id}`,
        async (err, result) => {
            if (err) console.error(err);
            result = result[0];
            let stock = JSON.parse(result.stock);
            let stockMoney = 0;
            for (var item in stock) {
                stockMoney += stock[item].buyPrice;
            }
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("#ffff00")
                        .setTitle(
                            `:moneybag: ${interaction.member.displayName} 님의 돈`
                        )
                        .setDescription(
                            `현금: \`${result.money.toLocaleString(
                                "ko-KR"
                            )}원\`\n주식: \`${stockMoney.toLocaleString(
                                "ko-KR"
                            )}원\`\n총액: \`${(
                                result.money + stockMoney
                            ).toLocaleString("ko-KR")}원\``
                        ),
                ],
            });
        }
    );
}

async function 송금(interaction) {
    if (interaction.options.getNumber("금액") < 1) {
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle(":warning: 오류")
                    .setDescription("1원 미만은 송금할 수 없습니다."),
            ],
        });
        return;
    }
    database.query(
        `SELECT id, money FROM users WHERE id = ${
            interaction.options.getUser("대상").id
        }`,
        async (err, result_target) => {
            if (err) console.error(err);
            if (result_target.length === 0) {
                await interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor("#ff0000")
                            .setTitle(":warning: 오류")
                            .setDescription(
                                "받을 상대가 가입되어 있지 않습니다."
                            ),
                    ],
                });
            } else {
                result_target = result_target[0];
                database.query(
                    `SELECT id, money FROM users WHERE id = ${interaction.member.id}`,
                    async (err, result_sender) => {
                        console.log(result_sender);
                        if (err) console.error(err);
                        result_sender = result_sender[0];
                        if (
                            interaction.options.getNumber("금액") >
                            result_sender.money
                        ) {
                            await interaction.reply({
                                embeds: [
                                    new MessageEmbed()
                                        .setColor("#ff0000")
                                        .setTitle(":warning: 오류")
                                        .setDescription("잔액이 부족합니다."),
                                ],
                            });
                        } else {
                            database.query(
                                `UPDATE users SET money = ${
                                    result_target.money +
                                    interaction.options.getNumber("금액")
                                } WHERE id = ${result_target.id}`,
                                (err) => {
                                    if (err) console.error(err);
                                }
                            );
                            database.query(
                                `UPDATE users SET money = ${
                                    result_sender.money -
                                    interaction.options.getNumber("금액")
                                } WHERE id = ${result_sender.id}`,
                                (err) => {
                                    if (err) console.error(err);
                                }
                            );
                            await interaction.reply({
                                embeds: [
                                    new MessageEmbed()
                                        .setColor("#008000")
                                        .setTitle(
                                            ":white_check_mark: 송금 완료"
                                        )
                                        .setDescription(
                                            `송금이 완료되었습니다.\n송금한 금액: \`${interaction.options
                                                .getNumber("금액")
                                                .toLocaleString(
                                                    "ko-KR"
                                                )}원\`\n송금 후 잔액: \`${(
                                                result_sender.money -
                                                interaction.options.getNumber(
                                                    "금액"
                                                )
                                            ).toLocaleString("ko-KR")}원\``
                                        ),
                                ],
                            });
                        }
                    }
                );
            }
        }
    );
}
