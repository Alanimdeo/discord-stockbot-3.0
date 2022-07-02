"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Command = exports.Bot = void 0;
const discord_js_1 = require("discord.js");
const time_1 = require("./modules/time");
class Bot extends discord_js_1.Client {
    constructor(options) {
        super(options);
        this.commands = new discord_js_1.Collection();
        this.adminCommands = new discord_js_1.Collection();
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
    constructor(id) {
        this.id = id;
        this.money = 1000000;
        this.stock = {};
        this.gold = { amount: 0, buyPrice: 0 };
        this.lottery = [];
        this.gamble = { count: 0, lastPlayed: (0, time_1.getToday)() };
        this.lastClaim = (0, time_1.getYesterday)();
    }
}
exports.User = User;
