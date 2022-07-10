"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
class Money {
    constructor(user, amount = 1000000) {
        this.user = user;
        this.amount = amount;
    }
    async setMoney(amount) {
        this.amount = amount;
        await updateMoney(this.user, this.amount);
        return this;
    }
    async addMoney(amount) {
        this.amount += amount;
        await updateMoney(this.user, this.amount);
        return this;
    }
    async reduceMoney(amount) {
        this.amount -= amount;
        await updateMoney(this.user, this.amount);
        return this;
    }
}
exports.Money = Money;
const updateMoney = async (user, money) => {
    await user.update([{ key: "money", value: String(money) }]);
};
