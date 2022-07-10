"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoldPrice = exports.Gold = void 0;
const axios_1 = __importDefault(require("axios"));
class Gold {
    constructor(user, amount, buyPrice) {
        this.user = user;
        this.amount = amount || 0;
        this.buyPrice = buyPrice || 0;
    }
    async setGold(amount) { }
    async addGold(amount) { }
    async reduceGold(amount) { }
    async removeGold(amount) { }
}
exports.Gold = Gold;
async function getGoldPrice() {
    const { data } = await axios_1.default.post("https://apiserver.koreagoldx.co.kr/api/price/chart/listByDate", {
        srchDt: "1M",
        type: "Au",
    });
    const gold = {
        buy: {
            price: data.sChartList[0].y,
            time: data.sChartList[0].x,
            diff: data.sChartList[0].t,
        },
        sell: {
            price: data.pChartList[0].y,
            time: data.pChartList[0].x,
            diff: data.pChartList[0].t,
        },
    };
    return gold;
}
exports.getGoldPrice = getGoldPrice;
