"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockFetchFailedError = exports.NotFoundError = exports.errorLog = exports.Embed = exports.User = exports.Command = exports.Bot = void 0;
const discord_js_1 = require("discord.js");
const time_1 = require("../modules/time");
const stock_1 = require("../modules/stock");
const money_1 = require("../modules/money");
const gold_1 = require("../modules/gold");
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
        this.money = money || new money_1.Money(id);
        this.stock = stock || new stock_1.UserStock(id);
        this.gold = gold || new gold_1.Gold(id);
        this.lottery = lottery || [];
        this.gamble = gamble || { count: 0, lastPlayed: (0, time_1.getToday)() };
        this.lastClaim = lastClaim || (0, time_1.getYesterday)();
    }
}
exports.User = User;
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
var error_1 = require("./error");
Object.defineProperty(exports, "errorLog", { enumerable: true, get: function () { return error_1.errorLog; } });
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return error_1.NotFoundError; } });
Object.defineProperty(exports, "StockFetchFailedError", { enumerable: true, get: function () { return error_1.StockFetchFailedError; } });
