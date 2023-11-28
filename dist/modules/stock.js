"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockInfo = exports.UserStock = void 0;
const axios_1 = __importDefault(require("axios"));
class UserStock {
    user;
    status;
    async setStock(code, amount, buyPrice) {
        if (amount < 0 || (buyPrice && buyPrice < 0)) {
            throw new Error("NegativeNumber");
        }
        else if (amount === 0) {
            console.log("If you want to remove stock, use removeStock instead.");
            return await this.removeStock(code);
        }
        this.status[code] = {
            amount,
            buyPrice: buyPrice || 1, // 0으로 하면 내주식 명령어 사용 시 수익률이 무한대가 됨
        };
        await updateStock(this.user, this.status);
        return this;
    }
    async addStock(code, amount, price) {
        if (amount < 0 || price < 0) {
            throw new Error("NegativeNumber");
        }
        if (!this.status[code]) {
            this.status[code] = {
                amount,
                buyPrice: price * amount,
            };
        }
        else {
            this.status[code].amount += amount;
            this.status[code].buyPrice += price * amount;
        }
        await updateStock(this.user, this.status);
        return this;
    }
    async reduceStock(code, amount, price) {
        if (amount < 0 || price < 0) {
            throw new Error("NegativeNumber");
        }
        else if (!this.status[code]) {
            throw new Error("NotHavingStock");
        }
        else if (this.status[code].amount < amount) {
            throw new Error("NotEnoughStock");
        }
        if (this.status[code].amount === amount) {
            return await this.removeStock(code);
        }
        else {
            this.status[code].amount -= amount;
            this.status[code].buyPrice -= price * amount;
            await updateStock(this.user, this.status);
            return this;
        }
    }
    async removeStock(code) {
        if (!this.status[code]) {
            throw new Error("NotHavingStock");
        }
        delete this.status[code];
        await updateStock(this.user, this.status);
        return this;
    }
    constructor(user, status = {}) {
        this.user = user;
        this.status = status;
    }
}
exports.UserStock = UserStock;
const updateStock = async (user, stock) => await user.update([{ key: "stock", value: JSON.stringify(stock) }]);
const getRiseFall = (rf) => {
    if (typeof rf === "number") {
        rf = String(rf);
    }
    switch (rf) {
        case "1":
            return "upperLimit";
        case "2":
            return "up";
        case "3":
            return "unchanged";
        case "4":
            return "down";
        case "5":
            return "lowerLimit";
        default:
            throw new Error("InvalidRiseFall");
    }
};
async function getStockInfo(query, corpList) {
    let code = "", name = "";
    if (isNaN(Number(query)) && Object.keys(corpList).includes(query)) {
        code = corpList[query];
        name = query;
    }
    else if (Object.values(corpList).includes(query.padStart(6, "0"))) {
        code = query.padStart(6, "0");
        name = Object.keys(corpList)[Object.values(corpList).indexOf(code)];
    }
    else {
        throw new Error("ResultNotFound");
    }
    const response = await (0, axios_1.default)(`https://polling.finance.naver.com/api/realtime?query=SERVICE_ITEM:${code}`);
    let data = response.data;
    if (response.status !== 200 || !data) {
        throw new Error("StockFetchFailed");
    }
    data = data.result.areas[0].datas[0];
    return {
        name,
        code,
        price: data.nv,
        risefall: getRiseFall(data.rf),
        diff: data.cv,
        diffRate: data.cr,
        high: data.hv,
        low: data.lv,
    };
}
exports.getStockInfo = getStockInfo;
