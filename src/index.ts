console.log("모듈 로딩 중...");
import fs from "fs";
import download from "download";
import xlsx from "xlsx";
import iconv from "iconv-lite";
import { Client, Collection, GuildMember, Intents, Interaction, Message, MessageEmbed } from "discord.js";
import { Bot, Command } from "./types";

console.log("설정 불러오는 중...");
import config from "./config";
import { verifyUser } from "./modules/database";

const bot: Bot = new Bot({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

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
  const command: Command = require(`./adminCommands/${file}`);
  console.log(`관리자 명령어 불러오는 중... (${command.data.name})`);
  bot.adminCommands.set(command.data.name, command);
}

bot.once("ready", async () => {
  console.log(`로그인 완료! 토큰: \x1b[32m${config.token}\x1b[0m`);
  console.log("상장기업 목록 다운로드 중...");
  const companies = await download("http://kind.krx.co.kr/corpgeneral/corpList.do?method=download");
  console.log("상장기업 목록 다운로드 완료!");
  console.log("상장기업 목록 정리 중...");
  const workbook = xlsx.read(iconv.decode(companies, "EUC-KR"), { type: "string" });
  const excel = workbook.Sheets[workbook.SheetNames[0]];
  // console.log(excel);
  console.log(excel["!cols"]);
  const corpList: {
    [corpName: string]: string;
  } = {};
  for (let i = 1; i < Number(excel["!ref"]!.split("I")[1]) + 1; i++) {
    corpList[excel["A" + i].v] = (excel["B" + i].v as number).toString().padStart(6, "0");
  }
  delete corpList.회사명;
  console.log(
    `상장기업 목록 정리 완료! 기업 수: \x1b[32m${Object.keys(corpList).length}\x1b[0m\n상장기업 목록 저장 중..`
  );
  fs.writeFile("./corpList.json", JSON.stringify(corpList, null, 2), "utf-8", (err) => {
    if (err) console.error(err);
    console.log("상장기업 목록 저장 완료!\n준비 완료!");
  });
});

bot.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;
  try {
    const command = bot.commands.get(interaction.commandName);
    if (!command) return;

    if (await verifyUser((interaction.member as GuildMember).id)) {
      await command.execute(interaction, bot);
    } else {
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("#ff0000")
            .setTitle(":warning: 가입 필요")
            .setDescription("가입이 필요합니다. `/가입`을 입력해 가입하세요."),
        ],
      });
    }
  } catch (err) {
    await interaction.reply(`오류가 발생했습니다. 오류 로그:\`\`\`${String(err)}\`\`\``);
  }
});

bot.on("messageCreate", async (message: Message) => {
  if (!message.content.startsWith(config.adminPrefix) || !config.adminIDs.includes(message.author.id)) return;

  const command = bot.adminCommands.get(message.content.split(" ")[1]);
  if (!command) return;

  await command.execute(message, bot);
});

console.log("Discord 로그인 중...");
bot.login(config.token);
