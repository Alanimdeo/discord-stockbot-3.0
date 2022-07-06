"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLog = exports.Embed = exports.User = exports.Command = exports.Bot = void 0;
const fs_1 = require("fs");
const discord_js_1 = require("discord.js");
const time_1 = require("./modules/time");
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
        this.stock = stock || {};
        this.gold = gold || { amount: 0, buyPrice: 0 };
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
function errorLog(err, caller) {
    (0, fs_1.appendFileSync)("./error.log", `[${new Date().toLocaleString()}] - ${caller}\n${String(err)}\n\n`);
}
exports.errorLog = errorLog;
