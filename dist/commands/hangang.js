"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("한강").setDescription("한강 수온을 확인합니다."), async (interaction) => {
    try {
        const response = await (0, axios_1.default)("http://hangang.dkserver.wo.tc");
        await interaction.editReply((0, types_1.Embed)({
            color: "#0067a3",
            icon: "ocean",
            title: "현재 한강 수온",
            description: `\`${response.data.temp}℃\`\n\n자살 예방 핫라인 :telephone: 1577-0199\n희망의 전화 :telephone: 129`,
        }));
    }
    catch (err) {
        await interaction.editReply((0, types_1.Embed)({
            color: "#ff0000",
            icon: "warning",
            title: "오류",
            description: "수온 정보를 받아오지 못했습니다. 다음에 다시 시도하세요.",
        }));
    }
});
