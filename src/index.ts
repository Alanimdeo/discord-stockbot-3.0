console.log("모듈 로딩 중...");
import fs from "fs";
import download from "download";
import xlsx from "xlsx";
import iconv from "iconv-lite";
import { ChatInputCommandInteraction, GatewayIntentBits, GuildMember, Interaction, Message } from "discord.js";
import { AdminCommand, Bot, Command, CorpList, Embed } from "./types";

console.log("설정 불러오는 중...");
import config from "./config";
import { verifyUser } from "./modules/database";

const bot: Bot = new Bot({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const commands = fs.readdirSync("./commands").filter((file: string) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of commands) {
  const command: Command = require(`./commands/${file}`);
  console.log(`명령어 불러오는 중... (${command.data.name})`);
  bot.commands.set(command.data.name, command);
}

const adminCommands = fs
  .readdirSync("./adminCommands")
  .filter((file: string) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of adminCommands) {
  const command: AdminCommand = require(`./adminCommands/${file}`);
  console.log(`관리자 명령어 불러오는 중... (${command.data.name})`);
  bot.adminCommands.set(command.data.command, command);
}

bot.once("ready", async () => {
  console.log(`로그인 완료! 토큰: \x1b[32m${config.token}\x1b[0m`);
  await getCorpList();
  setInterval(async () => {
    console.log("상장기업 목록을 새로고침합니다.");
    await getCorpList();
  }, 86400000);
  console.log("준비 완료!");
});

async function getCorpList() {
  console.log("상장기업 목록 다운로드 중...");
  const companies = await download("http://kind.krx.co.kr/corpgeneral/corpList.do?method=download");
  console.log("상장기업 목록 다운로드 완료!");
  console.log("상장기업 목록 정리 중...");
  const workbook = xlsx.read(iconv.decode(companies, "EUC-KR"), { type: "string" });
  const excel = workbook.Sheets[workbook.SheetNames[0]];
  const corpList: CorpList = {};
  for (let i = 1; i < Number(excel["!ref"]!.split("I")[1]) + 1; i++) {
    corpList[excel["A" + i].v] = String(excel["B" + i].v as number).padStart(6, "0");
  }
  delete corpList.회사명;
  console.log(`상장기업 목록 정리 완료! 기업 수: \x1b[32m${Object.keys(corpList).length}\x1b[0m`);
  bot.corpList = corpList;
  if (config.exportCorpListAsFile) {
    console.log("상장기업 목록 저장 중..");
    fs.writeFileSync("./corpList.json", JSON.stringify(corpList, null, 2), "utf-8");
    console.log("상장기업 목록 저장 완료!");
  }
}

bot.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;
  try {
    const command = bot.commands.get(interaction.commandName);
    if (!command) return;

    await interaction.deferReply();
    if (
      interaction instanceof ChatInputCommandInteraction &&
      (
        interaction.commandName === "가입" ||
        (await verifyUser((interaction.member as GuildMember).id))
      )
    ) {
      await command.execute(interaction, bot);
    } else {
      await interaction.editReply(
        Embed({
          color: "#ff0000",
          icon: "warning",
          title: "가입 필요",
          description: "가입이 필요합니다. `/가입`을 입력해 가입하세요.",
        })
      );
    }
  } catch (err) {
    await interaction.editReply(`오류가 발생했습니다. 오류 로그:\`\`\`${String(err)}\`\`\``);
  }
});

bot.on("messageCreate", async (message: Message) => {
  if (
    message.author.bot ||
    !message.content.startsWith(config.adminPrefix) ||
    !config.adminIDs.includes(message.author.id)
  )
    return;

  const command = bot.adminCommands.get(message.content.split(" ")[1]);
  if (!command) return;

  await command.execute(message, bot);
});

console.log("Discord 로그인 중...");
bot.login(config.token);
