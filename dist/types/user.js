"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mysql_1 = require("mysql");
const database_1 = require("../modules/database");
const gold_1 = require("../modules/gold");
const money_1 = require("../modules/money");
const stock_1 = require("../modules/stock");
const time_1 = require("../modules/time");
class User {
    constructor(id, money, stock, gold, lottery, gamble, lastClaim) {
        this.id = id;
        this.money = new money_1.Money(this, money);
        this.stock = new stock_1.UserStock(this, stock);
        this.gold = new gold_1.Gold(this, gold?.amount, gold?.buyPrice);
        this.lottery = lottery || [];
        this.gamble = gamble || { count: 0, lastPlayed: (0, time_1.getToday)() };
        this.lastClaim = lastClaim || (0, time_1.getYesterday)();
    }
    async update(options) {
        return new Promise(async (resolve, reject) => {
            const queries = [];
            options.map((q) => queries.push(`${q.key} = ${(0, mysql_1.format)("?", [q.value])}`));
            let queryString = queries.join(",");
            (0, database_1.query)(`UPDATE users SET ${queryString} WHERE id = ?`, [this.id], async (err) => {
                if (err)
                    return reject(err);
                return resolve(this);
            });
        });
    }
}
exports.User = User;
