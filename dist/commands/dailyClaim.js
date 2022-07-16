"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const database_1 = require("../modules/database");
const time_1 = require("../modules/time");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("용돈").setDescription("용돈을 받습니다. 하루에 1회 받을 수 있습니다."), async (interaction) => {
    const user = await (0, database_1.getUserdata)(interaction.user.id);
    if ((0, time_1.isToday)(new Date(user.lastClaim))) {
        await interaction.editReply((0, types_1.Embed)({
            color: "#ff0000",
            icon: "warning",
            title: "오류",
            description: "오늘 용돈을 이미 받았습니다. 내일 다시 시도하세요.",
        }));
        return;
    }
    const claimedMoney = Math.floor(Math.random() * 130 + 20) * 100;
    await user.money.addMoney(claimedMoney);
    await user.update([{ key: "lastClaim", value: (0, time_1.toDateString)() }]);
    await interaction.editReply((0, types_1.Embed)({
        color: "#008000",
        icon: "money_with_wings",
        title: "오늘의 용돈",
        description: `오늘 용돈으로 \`${claimedMoney.toLocaleString("ko-KR")}원\`을 받았습니다.\n현재 가진 돈: \`${user.money.amount.toLocaleString("ko-KR")}원\``,
    }));
});
