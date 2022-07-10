"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockInfo = exports.UserStock = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
const error_1 = require("../types/error");
class UserStock {
    constructor(user, status = {}) {
        this.user = user;
        this.status = status;
    }
    async setStock(code, amount, buyPrice) {
        if (amount < 0 || (buyPrice && buyPrice < 0)) {
            throw new error_1.NegativeNumberError("The amount or buyPrice of stock cannot be negative.");
        }
        else if (amount === 0) {
            console.log("If you want to remove stock, use removeStock instead.");
            return this.removeStock(code);
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
            throw new error_1.NegativeNumberError("Adding negative number using addStock can cause error because it doesn't check if the amount is 0. Use reduceStock or setStock or removeStock instead.");
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
            throw new error_1.NegativeNumberError("Reducing the amount of stock using reduceStock is not recommmended. use addStock instead.");
        }
        else if (!this.status[code]) {
            throw new types_1.NotFoundError("The user does not have this stock.");
        }
        else if (this.status[code].amount < amount) {
            throw new error_1.NegativeNumberError("The user does not have enough stock.");
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
            throw new types_1.NotFoundError("The user does not have this stock.");
        }
        delete this.status[code];
        await updateStock(this.user, this.status);
        return this;
    }
}
exports.UserStock = UserStock;
const updateStock = async (user, stock) => await user.update([{ key: "stock", value: JSON.stringify(stock) }]);
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
        throw new types_1.NotFoundError("Result not found.");
    }
    try {
        const response = await (0, axios_1.default)(`http://api.finance.naver.com/service/itemSummary.nhn?itemcode=${code}`);
        const data = response.data;
        if (response.status !== 200 || !data) {
            throw new types_1.StockFetchFailedError("Failed to get stock info.");
        }
        const risefall = data.risefall === 1
            ? "upperLimit"
            : data.risefall === 2
                ? "up"
                : data.risefall === 3
                    ? "unchanged"
                    : data.risefall === 4
                        ? "lowerLimit"
                        : "down";
        return {
            name,
            code,
            price: data.now,
            risefall,
            diff: data.diff,
            diffRate: data.rate,
            high: data.high,
            low: data.low,
        };
    }
    catch (err) {
        throw err;
    }
}
exports.getStockInfo = getStockInfo;
