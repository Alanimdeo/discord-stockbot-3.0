const mysql = require('mysql');
const https = require('https');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const config = require('../config.json');
const database = mysql.createConnection(config.mysql);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('로또')
        .setDescription('로또 관련 명령어')
        .addSubcommand(option =>
            option.setName('회차')
                .setDescription('회차별 로또 당첨번호를 확인합니다.')
                .addNumberOption(option =>
                    option.setName('회차')
                        .setDescription('확인할 로또 회차를 입력하세요.')
                        .setRequired(true)
                )
        ).addSubcommand(option =>
            option.setName('최근회차')
                .setDescription('가장 최근에 추첨된 로또 당첨번호를 확인합니다.')
        ).addSubcommand(option =>
            option.setName('확인')
                .setDescription('구매한 로또를 확인합니다.')
        ).addSubcommandGroup(option =>
            option.setName('구매')
                .setDescription('로또를 구매합니다. 토요일에는 오후 8시까지 구매 가능하며, 다음 회차는 일요일 0시부터 구매 가능합니다.')
                .addSubcommand(option =>
                    option.setName('자동')
                        .setDescription('자동으로 로또 번호를 생성합니다.')
                ).addSubcommand(option =>
                    option.setName('수동')
                        .setDescription('로또 번호를 직접 입력합니다.')
                        .addNumberOption(option =>
                            option.setName('번호1')
                                .setDescription('첫 번째 번호를 입력하세요.')
                                .setRequired(true)
                        ).addNumberOption(option =>
                            option.setName('번호2')
                                .setDescription('두 번째 번호를 입력하세요.')
                                .setRequired(true)
                        ).addNumberOption(option =>
                            option.setName('번호3')
                                .setDescription('세 번째 번호를 입력하세요.')
                                .setRequired(true)
                        ).addNumberOption(option =>
                            option.setName('번호4')
                                .setDescription('네 번째 번호를 입력하세요.')
                                .setRequired(true)
                        ).addNumberOption(option =>
                            option.setName('번호5')
                                .setDescription('다섯 번째 번호를 입력하세요.')
                                .setRequired(true)
                        ).addNumberOption(option =>
                            option.setName('번호6')
                                .setDescription('여섯 번째 번호를 입력하세요.')
                                .setRequired(true)
                        )
                )
        )
    ,
    async execute(interaction) {
        eval(`${interaction.options.getSubcommand()}(interaction)`);
	}
};

async function 최근회차(interaction) {
    getDrwInfo().then(async drwInfo => {
        await interaction.reply({ embeds: [new MessageEmbed().setColor('#008000').setTitle(`:slot_machine: ${drwInfo.drwNo}회차(${drwInfo.drwNoDate}) 로또 6/45 당첨번호`).setDescription(`**${drwInfo.drwtNo1} ${drwInfo.drwtNo2} ${drwInfo.drwtNo3} ${drwInfo.drwtNo4} ${drwInfo.drwtNo5} ${drwInfo.drwtNo6} + ${drwInfo.bnusNo}**\n\n1등 당첨자 수: ${drwInfo.firstPrzwnerCo.toLocaleString('ko-KR')}명\n1등 당첨금: ${drwInfo.firstWinamnt.toLocaleString('ko-KR')}원`)] });
    }).catch(async () => {
        await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription('아직 추첨이 진행되지 않았습니다.\n\n정규 추첨 시간: 매주 토요일 오후 8:45분')] });
    });
}

async function 회차(interaction) {
    getDrwInfo(interaction.options.getNumber('회차')).then(async drwInfo => {
        await interaction.reply({ embeds: [new MessageEmbed().setColor('#008000').setTitle(`:slot_machine: ${drwInfo.drwNo}회차(${drwInfo.drwNoDate}) 로또 6/45 당첨번호`).setDescription(`**${drwInfo.drwtNo1} ${drwInfo.drwtNo2} ${drwInfo.drwtNo3} ${drwInfo.drwtNo4} ${drwInfo.drwtNo5} ${drwInfo.drwtNo6} + ${drwInfo.bnusNo}**\n\n1등 당첨자 수: ${drwInfo.firstPrzwnerCo.toLocaleString('ko-KR')}명\n1등 당첨금: ${drwInfo.firstWinamnt.toLocaleString('ko-KR')}원`)] });
    }).catch(async () => {
        await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription('아직 추첨이 진행되지 않았습니다.\n\n정규 추첨 시간: 매주 토요일 오후 8:45분')] });
    });

}

async function 확인(interaction) {
    await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription('주식의 확인, 구매 기능은 현재 개발 중입니다.')] });
}

async function 자동(interaction) {
    await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription('주식의 확인, 구매 기능은 현재 개발 중입니다.')] });
}

async function 수동(interaction) {
    await interaction.reply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle(':warning: 오류').setDescription('주식의 확인, 구매 기능은 현재 개발 중입니다.')] });
}

function getDrwInfo(drwNo = getCurrentDrwNo()) {
    return new Promise((resolve, reject) => {
        https.get('https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=' + drwNo, resp => {
            var drwInfo = '';
            resp.on('data', chunk => { drwInfo += chunk; });
            resp.on('end', () => {
                drwInfo = JSON.parse(drwInfo);
                if (drwInfo.returnValue === 'success') {
                    resolve(drwInfo);
                } else {
                    reject(new Error());
                }
            });
        });
    });
}

function getCurrentDrwNo() {
    const nowTime = new Date();
    var drwNo = Number((nowTime.getTime() - 1038582000000) / 604800000);
    if (nowTime.getDay() === 6 && `${nowTime.getHours()}${nowTime.getMinutes()}` < 2045) drwNo -= 1;
    return Math.floor(drwNo);
}