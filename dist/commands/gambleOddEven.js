"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const database_1 = require("../modules/database");
const gamble_1 = require("../modules/gamble");
const types_1 = require("../types");
module.exports = new types_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("홀짝")
    .setDescription("홀과 짝 중 하나를 선택하여 맞출 경우 건 돈의 1.5배를 획득합니다.")
    .addStringOption((option) => option
    .setName("홀짝")
    .setDescription("홀 또는 짝을 선택하세요.")
    .addChoices({ name: "홀", value: "odd" }, { name: "짝", value: "even" })
    .setRequired(true))
    .addIntegerOption((option) => option.setName("금액").setDescription("베팅할 금액을 입력하세요.").setMinValue(1).setRequired(true)), async (interaction) => {
    const userdata = await (0, database_1.getUserdata)(interaction.user.id);
    if (!(await (0, gamble_1.checkDailyLimit)(userdata))) {
        await interaction.editReply(gamble_1.dailyLimitExceededEmbed);
        return;
    }
    const betMoney = interaction.options.getInteger("금액", true);
    if (userdata.money.amount < betMoney) {
        await interaction.editReply((0, types_1.Embed)({
            color: "#ff0000",
            icon: "warning",
            title: "오류",
            description: "가진 돈보다 많이 베팅할 수 없습니다.",
        }));
        return;
    }
    const random = Math.random() >= 0.5 ? "odd" : "even";
    const embedOption = {
        color: "#ffff00",
        title: `결과: ${random === "odd" ? "홀" : "짝"}`,
        description: "",
    };
    if (random === interaction.options.getString("홀짝", true)) {
        await userdata.money.addMoney(betMoney * 0.5);
        embedOption.icon = "tada";
        embedOption.description = `축하합니다! 도박에 성공하여 \`${(betMoney * 0.5).toLocaleString("ko-KR")}원\`을 얻었습니다.`;
    }
    else {
        await userdata.money.reduceMoney(betMoney);
        embedOption.icon = "disappointed_relieved";
        embedOption.description = `아쉽습니다. 도박에 실패하여 \`${betMoney.toLocaleString("ko-KR")}원\`을 잃었습니다.`;
    }
    embedOption.description += `\n현재 가진 돈: \`${userdata.money.amount.toLocaleString("ko-KR")}원\`\n오늘 남은 도박 횟수: ${10 - userdata.gamble.count}회`;
    await interaction.editReply((0, types_1.Embed)(embedOption));
});
