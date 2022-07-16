"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const database_1 = require("../modules/database");
const lottery_1 = require("../modules/lottery");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder()
    .setName("로또")
    .setDescription("로또 관련 명령어")
    .addSubcommand((command) => command
    .setName("회차확인")
    .setDescription("회차별 로또 당첨번호를 확인합니다.")
    .addIntegerOption((option) => option.setName("회차").setDescription("확인할 회차를 입력하세요. 회차를 미입력 시 최근 회차를 확인합니다.")))
    .addSubcommand((command) => command.setName("당첨확인").setDescription("구매한 로또의 당첨 여부를 확인합니다."))
    .addSubcommandGroup((commandGroup) => commandGroup
    .setName("구매")
    .setDescription("로또를 구매합니다. 토요일에는 오후 8시까지 구매 가능하며, 다음 회차는 일요일 0시부터 구매 가능합니다.")
    .addSubcommand((command) => command.setName("자동").setDescription("자동으로 번호를 생성한 로또를 구매합니다."))
    .addSubcommand((command) => command
    .setName("수동")
    .setDescription("로또 번호를 직접 입력한 후 구매합니다.")
    .addIntegerOption((option) => option
    .setName("번호1")
    .setDescription("첫 번째 번호를 입력하세요.")
    .setMinValue(1)
    .setMaxValue(45)
    .setRequired(true))
    .addIntegerOption((option) => option
    .setName("번호2")
    .setDescription("두 번째 번호를 입력하세요.")
    .setMinValue(1)
    .setMaxValue(45)
    .setRequired(true))
    .addIntegerOption((option) => option
    .setName("번호3")
    .setDescription("세 번째 번호를 입력하세요.")
    .setMinValue(1)
    .setMaxValue(45)
    .setRequired(true))
    .addIntegerOption((option) => option
    .setName("번호4")
    .setDescription("네 번째 번호를 입력하세요.")
    .setMinValue(1)
    .setMaxValue(45)
    .setRequired(true))
    .addIntegerOption((option) => option
    .setName("번호5")
    .setDescription("다섯 번째 번호를 입력하세요.")
    .setMinValue(1)
    .setMaxValue(45)
    .setRequired(true))
    .addIntegerOption((option) => option
    .setName("번호6")
    .setDescription("여섯 번째 번호를 입력하세요.")
    .setMinValue(1)
    .setMaxValue(45)
    .setRequired(true)))), async (interaction) => {
    return await eval(`(async () => {${interaction.options.getSubcommand()}(interaction, bot)})()`);
});
async function 회차확인(interaction) {
    try {
        const drwInfo = await (0, lottery_1.getDrwInfo)(interaction.options.getInteger("회차") || undefined);
        await interaction.editReply((0, types_1.Embed)({
            color: "#008000",
            icon: "slot_machine",
            title: `${drwInfo.drwNo}회차 로또 6/45 당첨번호`,
            description: `**${drwInfo.drwtNo.join(" ")} + ${drwInfo.bnusNo}**\n\n1등 당첨자 수: ${drwInfo.firstPrzwnerCo.toLocaleString("ko-KR")}명\n1등 당첨금: \`${drwInfo.firstAccumamnt.toLocaleString("ko-KR")}원\`\n1인 당: \`${drwInfo.firstWinamnt.toLocaleString("ko-KR")}원\``,
        }));
    }
    catch (err) {
        if (err instanceof Error) {
            const embedOption = {
                color: "#ff0000",
                icon: "warning",
                title: "오류",
                description: err.message + (err.cause?.message || ""),
            };
            switch (err.message) {
                case "NotDrawnYet":
                    if (err.cause?.message === "ExceedsLatestDrw") {
                        embedOption.description = "아직 추첨하지 않은 회차입니다.";
                    }
                    else if (err.cause?.message === "Saturday") {
                        embedOption.description =
                            "아직 추첨이 진행되지 않았습니다. 추첨 방송 종료 후 최대 1시간까지 반영이 지연될 수 있으니, 잠시 후 다시 시도하세요.";
                    }
                    break;
                case "IllegalDrwNo":
                    embedOption.description = "잘못된 회차입니다.";
                    break;
                case "DrwInfoFetchFailed":
                    embedOption.description = "추첨 정보를 가져오는데 실패했습니다.";
                    break;
            }
            await interaction.editReply((0, types_1.Embed)(embedOption));
        }
    }
}
async function 당첨확인(interaction) {
    try {
        const userdata = await (0, database_1.getUserdata)(interaction.user.id);
        if (userdata.lottery.length === 0) {
            await interaction.editReply((0, types_1.Embed)({
                color: "#ff0000",
                icon: "warning",
                title: "오류",
                description: "가진 로또가 없습니다.",
            }));
            return;
        }
        const drwInfos = {};
        const currentDrwNo = (0, lottery_1.getDrwNo)();
        await Promise.all(Array.from(new Set(userdata.lottery.map((drw) => drw.drwNo).filter((drwNo) => drwNo <= currentDrwNo))).map(async (drwNo) => {
            drwInfos[drwNo] = await (0, lottery_1.getDrwInfo)(drwNo, true);
        }));
        const reply = [`:information_source: ${interaction.member.displayName} 님의 로또 목록입니다.`];
        const shouldDelete = [];
        await Promise.all(userdata.lottery.map(async (drw, index) => {
            let prefix = "", prize = "";
            if (!Object.keys(drwInfos).includes(String(drw.drwNo))) {
                prefix = "\n*";
                prize = "(추첨 전)";
            }
            else {
                shouldDelete.push(index);
                const drwInfo = drwInfos[drw.drwNo];
                const correct = drw.numbers.filter((number) => drwInfo.drwtNo.includes(number)).length;
                if (correct < 3) {
                    prefix = "diff\n-";
                    prize = "(낙첨)";
                }
                else {
                    prefix = "diff\n+";
                    let prizeAmount = 0;
                    switch (correct) {
                        case 3:
                            prize = "(5등, 5,000원)";
                            prizeAmount = 5000;
                            break;
                        case 4:
                            prize = "(4등, 50,000원)";
                            prizeAmount = 50000;
                            break;
                        case 5:
                            if (!drw.numbers.includes(drwInfo.bnusNo)) {
                                prize = `(3등, ${drwInfo.prize.thirdPrize.toLocaleString("ko-KR")}원)`;
                                prizeAmount = drwInfo.prize.thirdPrize;
                            }
                            else {
                                prize = `(2등, ${drwInfo.prize.secondPrize.toLocaleString("ko-KR")}원)`;
                                prizeAmount = drwInfo.prize.secondPrize;
                            }
                            break;
                        case 6:
                            prize = `(1등, ${drwInfo.prize.firstPrize.toLocaleString("ko-KR")}원)`;
                            prizeAmount = drwInfo.prize.firstPrize;
                            break;
                    }
                    await userdata.money.addMoney(prizeAmount);
                }
            }
            reply.push(`\`\`\`${prefix} ${drw.drwNo}회차 | ${drw.numbers.join(" ")} ${prize}\`\`\``);
        }));
        await Promise.all(shouldDelete.map((index) => {
            delete userdata.lottery[index];
        }));
        userdata.lottery = userdata.lottery.filter(() => true);
        await userdata.update([{ key: "lottery", value: JSON.stringify(userdata.lottery) }]);
        await interaction.editReply(reply.length > 1
            ? reply.join("")
            : (0, types_1.Embed)({
                color: "#ff0000",
                icon: "warning",
                title: "오류",
                description: "가진 로또가 없습니다.",
            }));
    }
    catch (err) {
        console.error(err);
        await interaction.editReply((0, types_1.Embed)({
            color: "#ff0000",
            icon: "warning",
            title: "오류",
            description: "```\n" + String(err) + "\n```",
        }));
    }
}
async function 자동(interaction) {
    if (isPurchaseBlocked()) {
        await interaction.editReply(purchaseBlockedEmbed);
        return;
    }
    try {
        const userdata = await (0, database_1.getUserdata)(interaction.user.id);
        if (userdata.money.amount < 1000) {
            await interaction.editReply((0, types_1.Embed)({
                color: "#ff0000",
                icon: "warning",
                title: "오류",
                description: "돈이 부족합니다.",
            }));
            return;
        }
        const numbers = [0, 0, 0, 0, 0, 0];
        while (numbers.includes(0)) {
            const number = Math.floor(Math.random() * 45) + 1;
            if (!numbers.includes(number)) {
                numbers[numbers.indexOf(0)] = number;
            }
        }
        numbers.sort((a, b) => a - b);
        await userdata.money.reduceMoney(1000);
        const lottery = new lottery_1.Lottery(numbers, (0, lottery_1.getDrwNo)() + 1);
        await (0, lottery_1.addLottery)(userdata, lottery);
        await interaction.editReply((0, types_1.Embed)({
            color: "#008000",
            icon: "white_check_mark",
            title: "구매 완료",
            description: `로또를 구매했습니다.\n회차: ${lottery.drwNo}회\n번호: **${lottery.numbers.join(" ")}**`,
        }));
    }
    catch (err) {
        await interaction.editReply(handleError(err));
    }
}
function handleError(err) {
    const embedOption = {
        color: "#ff0000",
        icon: "warning",
        title: "오류",
        description: String(err),
    };
    if (err instanceof Error) {
        switch (err.message) {
            case "LotteryLimitExceeded":
                embedOption.title = "구매 한도 도달";
                embedOption.description = "회차당 최대 5게임까지 구매 가능합니다.\n\n한국도박문제 관리센터: :telephone: 1336";
                break;
            case "NotUniqueNumber":
                embedOption.description = "중복된 번호가 있습니다.";
                break;
        }
    }
    return (0, types_1.Embed)(embedOption);
}
async function 수동(interaction) {
    if (isPurchaseBlocked()) {
        await interaction.editReply(purchaseBlockedEmbed);
        return;
    }
    try {
        const userdata = await (0, database_1.getUserdata)(interaction.user.id);
        if (userdata.money.amount < 1000) {
            await interaction.editReply((0, types_1.Embed)({
                color: "#ff0000",
                icon: "warning",
                title: "오류",
                description: "돈이 부족합니다.",
            }));
            return;
        }
        const numbers = [
            interaction.options.getInteger("번호1", true),
            interaction.options.getInteger("번호2", true),
            interaction.options.getInteger("번호3", true),
            interaction.options.getInteger("번호4", true),
            interaction.options.getInteger("번호5", true),
            interaction.options.getInteger("번호6", true),
        ];
        numbers.sort((a, b) => a - b);
        await userdata.money.reduceMoney(1000);
        const lottery = new lottery_1.Lottery(numbers, (0, lottery_1.getDrwNo)() + 1);
        await (0, lottery_1.addLottery)(userdata, lottery);
        await interaction.editReply((0, types_1.Embed)({
            color: "#008000",
            icon: "white_check_mark",
            title: "구매 완료",
            description: `로또를 구매했습니다.\n회차: ${lottery.drwNo}회\n번호: **${lottery.numbers.join(" ")}**`,
        }));
    }
    catch (err) {
        await interaction.editReply(handleError(err));
    }
}
function isPurchaseBlocked() {
    const now = new Date();
    return now.getDate() === 6 && now.getHours() > 19;
}
const purchaseBlockedEmbed = (0, types_1.Embed)({
    color: "#ff0000",
    icon: "warning",
    title: "구매 불가",
    description: "토요일 로또 구매는 오후 8시까지만 가능합니다.\n다음 회차 로또는 내일부터 구매할 수 있습니다.",
});
