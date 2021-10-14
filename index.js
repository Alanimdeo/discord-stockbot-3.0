console.log("모듈 로딩 중..");
const fs = require("fs");
const download = require("download");
const xlsx = require("xlsx");
const iconv = require("iconv-lite");
const mysql = require("mysql");
const { Client, Collection, Intents, MessageEmbed } = require("discord.js");

const config = require("./config.json");

const database = mysql.createConnection(config.mysql);
console.log("모듈 로딩 완료!");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();

const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    console.log(`명령어 불러오는 중.. (${command.data.name})`);
    client.commands.set(command.data.name, command);
}

client.once("ready", () => {
    console.log(`로그인 완료! 토큰: \x1b[32m${config.token}\x1b[0m`);
    console.log("상장기업 목록 다운로드 중..");
    download(
        "http://kind.krx.co.kr/corpgeneral/corpList.do?method=download",
        "./"
    ).then(() => {
        console.log("상장기업 목록 다운로드 완료!");
        console.log("상장기업 목록 정리 중..");
        let workbook = xlsx.readFile(
            "%EC%83%81%EC%9E%A5%EB%B2%95%EC%9D%B8%EB%AA%A9%EB%A1%9D.xls"
        );
        let sheet = workbook.SheetNames[0];
        iconv.skipDecodeWarning = true;
        let excel = JSON.parse(
            iconv.decode(JSON.stringify(workbook.Sheets[sheet]), "euc-kr")
        );
        const corpList = {};
        for (let i = 1; i < Number(excel["!ref"].split("I")[1]) + 1; i++) {
            corpList[excel["A" + i].v] = excel["B" + i].v
                .toString()
                .padStart(6, "0");
        }
        delete corpList.회사명;
        console.log(
            `상장기업 목록 정리 완료! 기업 수: \x1b[32m${
                Object.keys(corpList).length
            }\x1b[0m\n상장기업 목록 저장 중..`
        );
        fs.writeFile(
            "./corpList.json",
            JSON.stringify(corpList),
            "utf-8",
            (err) => {
                if (err) console.error(err);
                console.log("상장기업 목록 저장 완료!\n준비 완료!");
            }
        );
    });
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        database.query(
            `SELECT id FROM users WHERE id = ${interaction.member.id}`,
            async (err, result) => {
                if (err) console.error(err);
                if (
                    result.length > 0 ||
                    interaction.commandName === "가입" ||
                    interaction.commandName === "도움말"
                ) {
                    await command.execute(interaction);
                } else {
                    await interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("#ff0000")
                                .setTitle(":warning: 가입 필요")
                                .setDescription(
                                    "가입이 필요합니다. `/가입`을 입력해 가입하세요."
                                ),
                        ],
                    });
                }
            }
        );
    } catch (error) {
        console.error(error);
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle(":warning: 오류")
                    .setDescription(
                        "오류가 발생했습니다. 관리자에게 문의하세요."
                    ),
            ],
            ephemeral: true,
        });
    }
});

console.log("Discord 서버에 로그인 중..");
client.login(config.token);
