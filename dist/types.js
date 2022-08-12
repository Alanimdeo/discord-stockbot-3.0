"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLog = exports.Embed = exports.AdminCommand = exports.Command = exports.Bot = void 0;
const fs_1 = require("fs");
const discord_js_1 = require("discord.js");
class Bot extends discord_js_1.Client {
    commands;
    adminCommands;
    corpList;
    constructor(options) {
        super(options);
        this.commands = new discord_js_1.Collection();
        this.adminCommands = new discord_js_1.Collection();
        this.corpList = {};
    }
}
exports.Bot = Bot;
class Command {
    data;
    execute;
    constructor(data, execute) {
        this.data = data;
        this.execute = execute;
    }
}
exports.Command = Command;
class AdminCommand {
    data;
    execute;
    constructor(data, execute) {
        this.data = data;
        this.execute = execute;
    }
}
exports.AdminCommand = AdminCommand;
function Embed(option) {
    const embed = new discord_js_1.EmbedBuilder();
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
