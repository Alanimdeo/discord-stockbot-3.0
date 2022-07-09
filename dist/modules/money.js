"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const database_1 = require("./database");
class Money {
    constructor(userId, amount = 1000000) {
        this.userId = userId;
        this.amount = amount;
    }
    async setMoney(amount) {
        this.amount = amount;
        await updateMoney(this.userId, this.amount);
        return this;
    }
    async addMoney(amount) {
        this.amount += amount;
        await updateMoney(this.userId, this.amount);
        return this;
    }
    async reduceMoney(amount) {
        this.amount -= amount;
        await updateMoney(this.userId, this.amount);
        return this;
    }
}
exports.Money = Money;
const updateMoney = async (id, money) => await (0, database_1.updateUserdata)(id, [{ key: "money", value: String(money) }]);
