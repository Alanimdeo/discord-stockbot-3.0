"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("모듈 로딩 중...");
const fs_1 = __importDefault(require("fs"));
const download_1 = __importDefault(require("download"));
const xlsx_1 = __importDefault(require("xlsx"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const discord_js_1 = require("discord.js");
const types_1 = require("./types");
console.log("설정 불러오는 중...");
const config_1 = __importDefault(require("./config"));
const database_1 = require("./modules/database");
const bot = new types_1.Bot({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
const commands = fs_1.default
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of commands) {
    const command = require(`./commands/${file}`);
    console.log(`명령어 불러오는 중... (${command.data.name})`);
    bot.commands.set(command.data.name, command);
}
const adminCommands = fs_1.default
    .readdirSync("./adminCommands")
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of adminCommands) {
    const command = require(`./adminCommands/${file}`);
    console.log(`관리자 명령어 불러오는 중... (${command.data.name})`);
    bot.adminCommands.set(command.data.command, command);
}
bot.once("ready", async () => {
    console.log(`로그인 완료! 토큰: \x1b[32m${config_1.default.token}\x1b[0m`);
    await getCorpList();
    setInterval(async () => {
        console.log("상장기업 목록을 새로고침합니다.");
        await getCorpList();
    }, 86400000);
    console.log("준비 완료!");
});
async function getCorpList() {
    console.log("상장기업 목록 다운로드 중...");
    const companies = await (0, download_1.default)("http://kind.krx.co.kr/corpgeneral/corpList.do?method=download");
    console.log("상장기업 목록 다운로드 완료!");
    console.log("상장기업 목록 정리 중...");
    const workbook = xlsx_1.default.read(iconv_lite_1.default.decode(companies, "EUC-KR"), {
        type: "string",
    });
    const excel = workbook.Sheets[workbook.SheetNames[0]];
    const corpList = {};
    for (let i = 1; i < Number(excel["!ref"].split("I")[1]) + 1; i++) {
        corpList[excel["A" + i].v] = String(excel["B" + i].v).padStart(6, "0");
    }
    delete corpList.회사명;
    console.log(`상장기업 목록 정리 완료! 기업 수: \x1b[32m${Object.keys(corpList).length}\x1b[0m`);
    bot.corpList = corpList;
    if (config_1.default.exportCorpListAsFile) {
        console.log("상장기업 목록 저장 중..");
        fs_1.default.writeFileSync("./corpList.json", JSON.stringify(corpList, null, 2), "utf-8");
        console.log("상장기업 목록 저장 완료!");
    }
}
bot.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand())
        return;
    try {
        const command = bot.commands.get(interaction.commandName);
        if (!command)
            return;
        await interaction.deferReply();
        if (interaction instanceof discord_js_1.ChatInputCommandInteraction &&
            (interaction.commandName === "가입" ||
                (await (0, database_1.verifyUser)(interaction.member.id)))) {
            await command.execute(interaction, bot);
        }
        else {
            await interaction.editReply((0, types_1.Embed)({
                color: "#ff0000",
                icon: "warning",
                title: "가입 필요",
                description: "가입이 필요합니다. `/가입`을 입력해 가입하세요.",
            }));
        }
    }
    catch (err) {
        await interaction.editReply(`오류가 발생했습니다. 오류 로그:\`\`\`${String(err)}\`\`\``);
    }
});
bot.on("messageCreate", async (message) => {
    if (message.author.bot ||
        !message.content.startsWith(config_1.default.adminPrefix) ||
        !config_1.default.adminIDs.includes(message.author.id))
        return;
    const command = bot.adminCommands.get(message.content.split(" ")[1]);
    if (!command)
        return;
    await command.execute(message, bot);
});
console.log("Discord 로그인 중...");
bot.login(config_1.default.token);
