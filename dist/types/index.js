"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockFetchFailedError = exports.NotFoundError = exports.errorLog = exports.Embed = exports.UserStock = exports.User = exports.Command = exports.Bot = void 0;
const discord_js_1 = require("discord.js");
const time_1 = require("../modules/time");
const error_1 = require("./error");
class Bot extends discord_js_1.Client {
    constructor(options) {
        super(options);
        this.commands = new discord_js_1.Collection();
        this.adminCommands = new discord_js_1.Collection();
        this.corpList = {};
    }
}
exports.Bot = Bot;
class Command {
    constructor(data, execute) {
        this.data = data;
        this.execute = execute;
    }
}
exports.Command = Command;
class User {
    constructor(id, money, stock, gold, lottery, gamble, lastClaim) {
        this.id = id;
        this.money = money || 1000000;
        this.stock = stock || new UserStock();
        this.gold = gold || { amount: 0, buyPrice: 0 };
        this.lottery = lottery || [];
        this.gamble = gamble || { count: 0, lastPlayed: (0, time_1.getToday)() };
        this.lastClaim = lastClaim || (0, time_1.getYesterday)();
    }
}
exports.User = User;
class UserStock {
    constructor(status = {}) {
        this.status = status;
    }
    setStock(code, amount, buyPrice) {
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
        return this;
    }
    addStock(code, amount, price) {
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
        return this;
    }
    reduceStock(code, amount, price) {
        if (amount < 0 || price < 0) {
            throw new error_1.NegativeNumberError("Reducing the amount of stock using reduceStock is not recommmended. use addStock instead.");
        }
        else if (!this.status[code]) {
            throw new error_1.NotFoundError("The user does not have this stock.");
        }
        this.status[code].amount -= amount;
        this.status[code].buyPrice -= price * amount;
        return this;
    }
    removeStock(code) {
        if (!this.status[code]) {
            throw new error_1.NotFoundError("The user does not have this stock.");
        }
        delete this.status[code];
        return this;
    }
}
exports.UserStock = UserStock;
function Embed(option) {
    const embed = new discord_js_1.MessageEmbed();
    embed.setColor(option.color);
    embed.setTitle(option.icon ? `:${option.icon}: ${option.title}` : option.title);
    embed.setDescription(option.description);
    if (option.image) {
        embed.setImage(option.image);
    }
    if (option.footer) {
        embed.setFooter(option.footer);
    }
    return {
        embeds: [embed],
    };
}
exports.Embed = Embed;
var error_2 = require("./error");
Object.defineProperty(exports, "errorLog", { enumerable: true, get: function () { return error_2.errorLog; } });
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return error_2.NotFoundError; } });
Object.defineProperty(exports, "StockFetchFailedError", { enumerable: true, get: function () { return error_2.StockFetchFailedError; } });
