"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoldPrice = exports.Gold = void 0;
const axios_1 = __importDefault(require("axios"));
class Gold {
    user;
    amount;
    buyPrice;
    async setGold(amount, price) {
        if (amount < 0 || (price && price < 0)) {
            throw new Error("NegativeNumber");
        }
        else if (amount === 0) {
            console.log("If you want to remove gold, use removeGold instead.");
            return await this.removeGold();
        }
        this.amount = amount;
        this.buyPrice = price || 1;
        await updateGold(this.user, this);
        return this;
    }
    async addGold(amount, buyPrice) {
        if (amount < 0 || buyPrice < 0) {
            throw new Error("NegativeNumber");
        }
        this.amount += amount;
        this.buyPrice += buyPrice * amount;
        await updateGold(this.user, this);
        return this;
    }
    async reduceGold(amount, sellPrice) {
        if (amount < 0 || sellPrice < 0) {
            throw new Error("NegativeNumber");
        }
        else if (this.amount < amount) {
            throw new Error("NotEnoughGold");
        }
        if (this.amount === amount) {
            return await this.removeGold();
        }
        this.amount -= amount;
        this.buyPrice -= sellPrice * amount;
        await updateGold(this.user, this);
        return this;
    }
    async removeGold() {
        this.amount = 0;
        this.buyPrice = 0;
        await updateGold(this.user, this);
        return this;
    }
    toQueryOption() {
        return {
            key: "gold",
            value: JSON.stringify({ amount: this.amount, buyPrice: this.buyPrice }),
        };
    }
    constructor(user, amount, buyPrice) {
        this.user = user;
        this.amount = amount || 0;
        this.buyPrice = buyPrice || 0;
    }
}
exports.Gold = Gold;
const updateGold = async (user, gold) => await user.update([gold.toQueryOption()]);
async function getGoldPrice() {
    try {
        const { data } = await axios_1.default.post("https://apiserver.koreagoldx.co.kr/api/price/chart/listByDate", {
            srchDt: "1M",
            type: "Au",
        }, {
            headers: {
                Referer: "https://www.koreagoldx.co.kr/",
            },
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
    catch {
        throw new Error("GoldFetchFailed");
    }
}
exports.getGoldPrice = getGoldPrice;
