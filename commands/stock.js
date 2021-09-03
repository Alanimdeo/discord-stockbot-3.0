const http = require('http');
const mysql = require('mysql');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const config = require('../config.json');
const database = mysql.createConnection(config.mysql);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('주식')
		.setDescription('주식 관련 명령어')
        .addSubcommand(option =>
            option.setName('확인')
                .setDescription('주식 가격을 확인합니다.')
                .addStringOption(option =>
                    option.setName('회사명')
                        .setDescription('회사명을 입력하세요. (종목코드도 가능)')
                        .setRequired(true)
                )
        ).addSubcommand(option =>
            option.setName('내주식')
                .setDescription('보유한 주식을 확인합니다.')
        ).addSubcommand(option =>
            option.setName('구매')
                .setDescription('주식을 구매합니다.')
                .addStringOption(option =>
                    option.setName('회사명')
                        .setDescription('회사명을 입력하세요. (종목코드도 가능)')
                        .setRequired(true)
                ).addNumberOption(option =>
                    option.setName('수량')
                        .setDescription('수량을 입력하세요.')
                        .setRequired(true)
                )
        ).addSubcommand(option =>
            option.setName('판매')
                .setDescription('주식을 판매합니다.')
                .addStringOption(option =>
                    option.setName('회사명')
                        .setDescription('회사명을 입력하세요. (종목코드도 가능)')
                        .setRequired(true)
                ).addNumberOption(option =>
                    option.setName('수량')
                        .setDescription('수량을 입력하세요.')
                        .setRequired(true)
                )
        )
    ,
	async execute(interaction) {
        eval(`${interaction.options.getSubcommand()}(interaction)`);
	}
};

async function 확인(interaction) {
    getStockData(interaction, interaction.options.getString('회사명'), async (code, stockData, company) => {
        await interaction.reply({ embeds: [new MessageEmbed().setColor('#0090ff').setTitle(`:chart_with_upwards_trend: ${company}(${code})의 현재 주가`).setDescription(`\`${stockData.nv.toLocaleString('ko-KR')}원\``).setImage(`https://ssl.pstatic.net/imgfinance/chart/item/area/day/${code}.png?sidcode=${new Date().getTime()}`)] });
    });
}

function getStockData(interaction, requestedCode, callback) {
    let code = '';
    let company = '';
    const corpList = require('../corpList.json');
    if (isNaN(Number(requestedCode))) {
        code = corpList[requestedCode];
        company = requestedCode;
    } else {
        code = requestedCode.padStart(6, '0');
        company = Object.keys(corpList)[Object.values(corpList).indexOf(code)];
    }
    http.get('http://polling.finance.naver.com/api/realtime?query=SERVICE_ITEM:' + code, resp => {
        var data = '';
        resp.on('data', chunk => { data += chunk; });
        resp.on('end', async () => {
            const stockData = JSON.parse(data).result.areas[0].datas[0];
            if (stockData === undefined) {
                await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription('없는 기업입니다. 회사명 또는 종목코드를 알맞게 입력하였는지 확인하세요.')] });
            } else {
                callback(code, stockData, company);
            }
        });
    }).end();
}

async function 내주식(interaction) {
    const userID = interaction.member.id;
    const corpList = require('../corpList.json');
    database.query(`SELECT stock FROM users WHERE id = ${userID}`, async (err, result) => {
        if (err) console.error(err);
        if (result.length > 0) {
            interaction.guild.members.fetch(userID).then(async userInfo => {
                let userStock = JSON.parse(result[0].stock);
                let willSendMessage = `:information_source: ${userInfo.displayName} 님의 주식 상태입니다.\n`;
                let processed = 0;
                for (var i in userStock) {
                    getStockData(interaction, i, async (code, stockData) => {
                        let nowValue = stockData.nv;
                        let name = Object.keys(corpList)[Object.values(corpList).indexOf(code)];
                        let query = userStock[code];
                        let avgPrice = Math.floor(query.buyPrice / query.amount);
                        if (avgPrice < nowValue) {
                            willSendMessage += `\`\`\`diff\n- ${name}(${code}): ${query.amount.toLocaleString('ko-KR')}주 (평균 구매가 ${(avgPrice).toLocaleString('ko-KR')}원, 현재 ${nowValue.toLocaleString('ko-KR')}원)[+${(query.amount * nowValue - query.buyPrice).toLocaleString('ko-KR')}원, +${(((query.amount * nowValue) / query.buyPrice * 100).toFixed(2) - 100).toLocaleString('ko-KR')}%]`;
                        } else if (avgPrice > nowValue) {
                            willSendMessage += `\`\`\`yaml\n= ${name}(${code}): ${query.amount.toLocaleString('ko-KR')}주 (평균 구매가 ${(avgPrice).toLocaleString('ko-KR')}원, 현재 ${nowValue.toLocaleString('ko-KR')}원)[${(query.amount * nowValue - query.buyPrice).toLocaleString('ko-KR')}원, -${((query.buyPrice / (query.amount * nowValue) * 100).toFixed(2) - 100).toLocaleString('ko-KR')}%]`;
                        } else {
                            willSendMessage += `\`\`\`\n* ${name}(${code}): ${query.amount.toLocaleString('ko-KR')}주 (평균 구매가 ${(avgPrice).toLocaleString('ko-KR')}원, 현재 ${nowValue.toLocaleString('ko-KR')}원)[=]`;
                        }
                        if (stockData.tyn === 'Y') willSendMessage += `[거래정지]`;
                        willSendMessage += '```';
                        processed++;
                        if (processed === Object.keys(userStock).length) {
                            await interaction.reply(willSendMessage);
                        }
                    });
                }
            });
        } else {
            await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription('없는 유저입니다.')] });
        }
    });
}

async function 구매(interaction) {
    getStockData(interaction, interaction.options.getString('회사명'), async (code, stockData, company) => {
        database.query(`SELECT money, stock FROM users WHERE id = ${interaction.member.id}`, async (err, result) => {
            if (err) console.error(err);
            let money = result[0].money;
            let amount = interaction.options.getNumber('수량');
            let userStock = JSON.parse(result[0].stock);
            let price = stockData.nv;
            if (price * amount > money) {
                await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription('돈이 부족합니다.')] });
            } else if (amount < 1) {
                await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription('1개 미만은 구매할 수 없습니다.')] });
            } else {
                if (userStock[code]) {
                    userStock[code].amount += amount;
                    userStock[code].buyPrice += price * amount;
                } else {
                    userStock[code] = {};
                    userStock[code]['amount'] = amount;
                    userStock[code]['buyPrice'] = price * amount;
                }
                database.query(`UPDATE users SET money = ${money - price * amount}, stock = '${JSON.stringify(userStock)}' WHERE id = ${interaction.member.id}`, async err => {
                    if (err) console.error(err);
                    await interaction.reply({ embeds: [new MessageEmbed().setColor('#008000').setTitle(':white_check_mark: 구매 완료').setDescription(`${company}(${code}) 주식을 구매했습니다.\n구매 금액: \`${price.toLocaleString('ko-KR')} × ${amount.toLocaleString('ko-KR')} = ${(price * amount).toLocaleString('ko-KR')}원\`\n보유 중인 주식: \`${userStock[code].amount.toLocaleString('ko-KR')}주\`\n남은 돈: \`${(money - price * amount).toLocaleString('ko-KR')}원\``)] });
                });
            }
        });
    });
}

async function 판매(interaction) {
    getStockData(interaction, interaction.options.getString('회사명'), async (code, stockData, company) => {
        database.query(`SELECT money, stock FROM users WHERE id = ${interaction.member.id}`, async (err, result) => {
            if (err) console.error(err);
            let money = result[0].money;
            let amount = interaction.options.getNumber('수량');
            let userStock = JSON.parse(result[0].stock);
            let price = stockData.nv;
            if (userStock[code] === undefined) {
                await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription(`${company}(${code})의 주식을 가지고 있지 않습니다.`)] });
            } else if (amount > userStock[code].amount) {
                await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription(`가진 주식보다 많이 판매할 수 없습니다.`)] });
            } else if (amount < 1) {
                await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription('1개 미만은 판매할 수 없습니다.')] });
            } else {
                userStock[code].amount -= amount;
                userStock[code].buyPrice -= price * amount;
                const amountRemaining = userStock[code].amount;
                if (userStock[code].amount === 0) delete userStock[code];
                database.query(`UPDATE users SET money = ${money + price * amount}, stock = '${JSON.stringify(userStock)}' WHERE id = ${interaction.member.id}`, async err => {
                    if (err) console.error(err);
                    await interaction.reply({ embeds: [new MessageEmbed().setColor('#008000').setTitle(':white_check_mark: 판매 완료').setDescription(`${company}(${code}) 주식을 판매했습니다.\n판매 금액: \`${price.toLocaleString('ko-KR')} × ${amount.toLocaleString('ko-KR')} = ${(price * amount).toLocaleString('ko-KR')}원\`\n남은 주식: \`${amountRemaining.toLocaleString('ko-KR')}주\`\n보유 중인 돈: \`${(money + price * amount).toLocaleString('ko-KR')}원\``)] });
                });
            }
        });
    });
}