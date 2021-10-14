const mysql = require("mysql");
const https = require("https");
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const config = require("../config.json");
const database = mysql.createConnection(config.mysql);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("로또")
        .setDescription("로또 관련 명령어")
        .addSubcommand((option) =>
            option
                .setName("회차")
                .setDescription("회차별 로또 당첨번호를 확인합니다.")
                .addNumberOption((option) =>
                    option
                        .setName("회차")
                        .setDescription("확인할 로또 회차를 입력하세요.")
                        .setRequired(true)
                )
        )
        .addSubcommand((option) =>
            option
                .setName("최근회차")
                .setDescription(
                    "가장 최근에 추첨된 로또 당첨번호를 확인합니다."
                )
        )
        .addSubcommand((option) =>
            option.setName("확인").setDescription("구매한 로또를 확인합니다.")
        )
        .addSubcommandGroup((option) =>
            option
                .setName("구매")
                .setDescription(
                    "로또를 구매합니다. 토요일에는 오후 8시까지 구매 가능하며, 다음 회차는 일요일 0시부터 구매 가능합니다."
                )
                .addSubcommand((option) =>
                    option
                        .setName("자동")
                        .setDescription("자동으로 로또 번호를 생성합니다.")
                )
                .addSubcommand((option) =>
                    option
                        .setName("수동")
                        .setDescription("로또 번호를 직접 입력합니다.")
                        .addIntegerOption((option) =>
                            option
                                .setName("번호1")
                                .setDescription("첫 번째 번호를 입력하세요.")
                                .setRequired(true)
                        )
                        .addIntegerOption((option) =>
                            option
                                .setName("번호2")
                                .setDescription("두 번째 번호를 입력하세요.")
                                .setRequired(true)
                        )
                        .addIntegerOption((option) =>
                            option
                                .setName("번호3")
                                .setDescription("세 번째 번호를 입력하세요.")
                                .setRequired(true)
                        )
                        .addIntegerOption((option) =>
                            option
                                .setName("번호4")
                                .setDescription("네 번째 번호를 입력하세요.")
                                .setRequired(true)
                        )
                        .addIntegerOption((option) =>
                            option
                                .setName("번호5")
                                .setDescription("다섯 번째 번호를 입력하세요.")
                                .setRequired(true)
                        )
                        .addIntegerOption((option) =>
                            option
                                .setName("번호6")
                                .setDescription("여섯 번째 번호를 입력하세요.")
                                .setRequired(true)
                        )
                )
        ),
    async execute(interaction) {
        eval(`${interaction.options.getSubcommand()}(interaction)`);
    },
};

async function 최근회차(interaction) {
    getDrwInfo()
        .then(async (drwInfo) => {
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("#008000")
                        .setTitle(
                            `:slot_machine: ${drwInfo.drwNo}회차(${drwInfo.drwNoDate}) 로또 6/45 당첨번호`
                        )
                        .setDescription(
                            `**${drwInfo.drwtNo1} ${drwInfo.drwtNo2} ${
                                drwInfo.drwtNo3
                            } ${drwInfo.drwtNo4} ${drwInfo.drwtNo5} ${
                                drwInfo.drwtNo6
                            } + ${
                                drwInfo.bnusNo
                            }**\n\n1등 당첨자 수: ${drwInfo.firstPrzwnerCo.toLocaleString(
                                "ko-KR"
                            )}명\n1등 당첨금: ${drwInfo.firstWinamnt.toLocaleString(
                                "ko-KR"
                            )}원`
                        ),
                ],
            });
        })
        .catch(async () => {
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("#ff0000")
                        .setTitle(":warning: 오류")
                        .setDescription(
                            "아직 추첨이 진행되지 않았습니다.\n\n정규 추첨 시간: 매주 토요일 오후 8:45분"
                        ),
                ],
            });
        });
}

async function 회차(interaction) {
    getDrwInfo(interaction.options.getNumber("회차"))
        .then(async (drwInfo) => {
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("#008000")
                        .setTitle(
                            `:slot_machine: ${drwInfo.drwNo}회차(${drwInfo.drwNoDate}) 로또 6/45 당첨번호`
                        )
                        .setDescription(
                            `**${drwInfo.drwtNo1} ${drwInfo.drwtNo2} ${
                                drwInfo.drwtNo3
                            } ${drwInfo.drwtNo4} ${drwInfo.drwtNo5} ${
                                drwInfo.drwtNo6
                            } + ${
                                drwInfo.bnusNo
                            }**\n\n1등 당첨자 수: ${drwInfo.firstPrzwnerCo.toLocaleString(
                                "ko-KR"
                            )}명\n1등 당첨금: ${drwInfo.firstWinamnt.toLocaleString(
                                "ko-KR"
                            )}원`
                        ),
                ],
            });
        })
        .catch(async () => {
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("#ff0000")
                        .setTitle(":warning: 오류")
                        .setDescription(
                            "아직 추첨이 진행되지 않았습니다.\n\n정규 추첨 시간: 매주 토요일 오후 8:45분"
                        ),
                ],
            });
        });
}

async function 확인(interaction) {
    await interaction.reply({
        embeds: [
            new MessageEmbed()
                .setColor("#ff0000")
                .setTitle(":warning: 오류")
                .setDescription("주식의 확인, 구매 기능은 현재 개발 중입니다."),
        ],
    });
}

async function 자동(interaction) {
    await interaction.deferReply();
    const now = new Date();
    if (now.getDate() == 6 && now.getHours() > 19) {
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle(":warning: 구매 불가")
                    .setDescription(
                        "토요일 로또 구매는 오후 8시까지만 가능합니다.\n다음 회차 로또의 경우 일요일 0시부터 구매 가능합니다."
                    ),
            ],
        });
        return;
    }
    database.query(
        `SELECT money, lottery FROM users WHERE id = ${interaction.member.id}`,
        async (err, result) => {
            if (err) {
                console.error(err);
                await interaction.editReply(
                    "오류가 발생했습니다. 관리자에게 문의하세요."
                );
            } else {
                var lottery = JSON.parse(result[0].lottery);
                var currentDrwNo = getCurrentDrwNo();
                var current = 0;
                lottery.forEach((element) => {
                    if (element.drwNo == currentDrwNo) current++;
                });
                if (current == 5) {
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("#ffff00")
                                .setTitle(":warning: 구매 한도 도달")
                                .setDescription(
                                    "회차당 최대 5게임까지 구매 가능합니다.\n\n한국도박문제 관리센터: :telephone: 1336"
                                ),
                        ],
                    });
                } else if (result[0].money < 1000) {
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("#ff0000")
                                .setTitle(":warning: 잔액 부족")
                                .setDescription("가진 돈이 부족합니다."),
                        ],
                    });
                } else {
                    var numbers = [];
                    while (numbers.length < 6) {
                        var temp = Math.floor(Math.random() * 45) + 1;
                        if (!numbers.includes(temp)) {
                            numbers.push(temp);
                        }
                    }
                    numbers.sort((f, s) => {
                        return f - s;
                    });
                    buyLottery(
                        interaction.member.id,
                        result[0].money - 1000,
                        numbers[0],
                        numbers[1],
                        numbers[2],
                        numbers[3],
                        numbers[4],
                        numbers[5]
                    ).then(async () => {
                        await interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor("#008000")
                                    .setTitle(":white_check_mark: 구매 완료")
                                    .setDescription(
                                        `로또를 구매했습니다.\n회차: ${getCurrentDrwNo()}회\n번호: **${
                                            numbers[0]
                                        } ${numbers[1]} ${numbers[2]} ${
                                            numbers[3]
                                        } ${numbers[4]} ${numbers[5]}**`
                                    ),
                            ],
                        });
                    });
                }
            }
        }
    );
}

async function 수동(interaction) {
    await interaction.deferReply();
    database.query(
        `SELECT money, lottery FROM users WHERE id = ${interaction.member.id}`,
        async (err, result) => {
            if (err) {
                console.error(err);
                await interaction.editReply(
                    "오류가 발생했습니다. 관리자에게 문의하세요."
                );
            } else {
                var lottery = JSON.parse(result[0].lottery);
                var currentDrwNo = getCurrentDrwNo();
                var current = 0;
                lottery.forEach((element) => {
                    if (element.drwNo == currentDrwNo) current++;
                });
                if (current == 5) {
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("#ffff00")
                                .setTitle(":warning: 구매 한도 도달")
                                .setDescription(
                                    "회차당 최대 5게임까지 구매 가능합니다.\n\n한국도박문제 관리센터: :telephone: 1336"
                                ),
                        ],
                    });
                } else if (result[0].money < 1000) {
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("#ff0000")
                                .setTitle(":warning: 잔액 부족")
                                .setDescription("가진 돈이 부족합니다."),
                        ],
                    });
                } else {
                    var numbers = [
                        interaction.options.getInteger("번호1"),
                        interaction.options.getInteger("번호2"),
                        interaction.options.getInteger("번호3"),
                        interaction.options.getInteger("번호4"),
                        interaction.options.getInteger("번호5"),
                        interaction.options.getInteger("번호6"),
                    ];
                    for (var i = 0; i < 6; i++) {
                        var temp = numbers.shift();
                        console.log(numbers);
                        console.log(temp);
                        console.log(numbers.includes(temp));
                        if (temp > 45 || temp < 1) {
                            await interaction.editReply({
                                embeds: [
                                    new MessageEmbed()
                                        .setColor("#ff0000")
                                        .setTitle(":warning: 오류")
                                        .setDescription(
                                            "1에서 45 사이 숫자만 입력 가능합니다."
                                        ),
                                ],
                            });
                            return;
                        } else if (numbers.includes(temp)) {
                            await interaction.editReply({
                                embeds: [
                                    new MessageEmbed()
                                        .setColor("#ff0000")
                                        .setTitle(":warning: 오류")
                                        .setDescription(
                                            "같은 번호를 2개 입력할 수 없습니다."
                                        ),
                                ],
                            });
                            return;
                        } else {
                            numbers.push(temp);
                        }
                    }
                    numbers.sort((f, s) => {
                        return f - s;
                    });
                    buyLottery(
                        interaction.member.id,
                        result[0].money - 1000,
                        numbers[0],
                        numbers[1],
                        numbers[2],
                        numbers[3],
                        numbers[4],
                        numbers[5]
                    ).then(async () => {
                        await interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor("#008000")
                                    .setTitle(":white_check_mark: 구매 완료")
                                    .setDescription(
                                        `로또를 구매했습니다.\n회차: ${getCurrentDrwNo()}회\n번호: **${
                                            numbers[0]
                                        } ${numbers[1]} ${numbers[2]} ${
                                            numbers[3]
                                        } ${numbers[4]} ${numbers[5]}**`
                                    ),
                            ],
                        });
                    });
                }
            }
        }
    );
}

function buyLottery(user, money, n1, n2, n3, n4, n5, n6) {
    return new Promise((resolve, reject) => {
        try {
            database.query(
                `SELECT lottery FROM users WHERE id = ${user}`,
                (err, result) => {
                    if (err) {
                        console.error(err);
                        reject(new Error(err.message));
                    }
                    let lottery = JSON.parse(result[0].lottery);
                    lottery.push({
                        drwNo: getCurrentDrwNo(),
                        numbers: [n1, n2, n3, n4, n5, n6],
                    });
                    database.query(
                        `UPDATE users SET lottery = '${JSON.stringify(
                            lottery
                        )}', money = ${money} WHERE id = ${user}`,
                        (err) => {
                            if (err) {
                                console.error(err);
                                reject(new Error(err.message));
                            } else {
                                resolve(true);
                            }
                        }
                    );
                }
            );
        } catch (err) {
            console.error(err);
            return;
        }
    });
}

function getDrwInfo(drwNo = getCurrentDrwNo()) {
    return new Promise((resolve, reject) => {
        https.get(
            "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=" +
                drwNo,
            (resp) => {
                var drwInfo = "";
                resp.on("data", (chunk) => {
                    drwInfo += chunk;
                });
                resp.on("end", () => {
                    drwInfo = JSON.parse(drwInfo);
                    if (drwInfo.returnValue === "success") {
                        resolve(drwInfo);
                    } else {
                        reject(new Error());
                    }
                });
            }
        );
    });
}

function getCurrentDrwNo() {
    const nowTime = new Date();
    var drwNo = Number((nowTime.getTime() - 1038582000000) / 604800000);
    if (
        nowTime.getDay() === 6 &&
        `${nowTime.getHours()}${nowTime.getMinutes()}` < 2045
    )
        drwNo -= 1;
    return Math.floor(drwNo);
}
