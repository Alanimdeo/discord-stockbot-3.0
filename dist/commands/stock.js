"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const stock_1 = require("../modules/stock");
const types_1 = require("../types");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName("주식")
        .setDescription("주식 관련 명령어")
        .addSubcommand((command) => command
        .setName("확인")
        .setDescription("주식 가격을 확인합니다.")
        .addStringOption((option) => option.setName("회사명").setDescription("회사명 또는 종목코드를 입력하세요.").setRequired(true)))
        .addSubcommand((command) => command.setName("내주식").setDescription("보유한 주식의 상태를 확인합니다."))
        .addSubcommand((command) => command
        .setName("구매")
        .setDescription("주식을 구매합니다.")
        .addStringOption((option) => option.setName("회사명").setDescription("회사명 또는 종목코드를 입력하세요.").setRequired(true))
        .addIntegerOption((option) => option
        .setName("수량")
        .setDescription("수량을 입력하세요. 0 이하의 값을 입력할 시 구매할 수 있는 수량 전체를 구매합니다.")
        .setRequired(true)))
        .addSubcommand((command) => command
        .setName("판매")
        .setDescription("주식을 판매합니다.")
        .addStringOption((option) => option.setName("회사명").setDescription("회사명 또는 종목코드를 입력하세요.").setRequired(true))
        .addIntegerOption((option) => option
        .setName("수량")
        .setDescription("수량을 입력하세요. 0 이하의 값을 입력할 시 판매할 수 있는 수량 전체를 판매합니다.")
        .setRequired(true))),
    execute: async (interaction, bot) => {
        return await eval(`${interaction.options.getSubcommand()}(interaction, bot)`);
    },
};
async function 확인(interaction, bot) {
    try {
        const stockInfo = await (0, stock_1.getStockInfo)(interaction.options.getString("회사명"), bot.corpList);
        await interaction.editReply((0, types_1.Embed)({
            color: "#0090ff",
            icon: "chart_with_upwards_trend",
            title: `${stockInfo.name}(${stockInfo.code})의 현재 주가`,
            description: `\`${stockInfo.price.toLocaleString("ko-KR")}원\``,
            image: `https://ssl.pstatic.net/imgfinance/chart/item/area/day/${stockInfo.code}.png?sidcode=${new Date().getTime()}`,
        }));
    }
    catch (err) {
        if (err instanceof Error) {
            const option = {
                color: "#ff0000",
                icon: "warning",
                title: "알 수 없는 오류",
                description: "알 수 없는 오류가 발생했습니다. 개발자에게 문의하세요.",
            };
            switch (err.message) {
                case "Result not found.":
                    option.title = "검색 결과 없음";
                    option.description = "검색 결과가 없습니다. 회사명 또는 종목코드를 올바르게 입력하였는지 확인하세요.";
                    break;
                case "Failed to get stock info.":
                    option.title = "주식 정보 읽기 실패";
                    option.description = "주식 정보를 읽어오는 데 실패했습니다. 서버 문제일 수 있으니 나중에 다시 시도해 보세요.";
                    break;
                default:
                    (0, types_1.errorLog)(err, "commands/stock");
                    console.log(err);
            }
            await interaction.editReply((0, types_1.Embed)(option));
        }
    }
}
