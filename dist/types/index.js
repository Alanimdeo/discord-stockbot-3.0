"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockFetchFailedError = exports.NotFoundError = exports.errorLog = exports.User = exports.Embed = exports.Command = exports.Bot = void 0;
const discord_js_1 = require("discord.js");
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
var user_1 = require("./user");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return user_1.User; } });
var error_1 = require("./error");
Object.defineProperty(exports, "errorLog", { enumerable: true, get: function () { return error_1.errorLog; } });
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return error_1.NotFoundError; } });
Object.defineProperty(exports, "StockFetchFailedError", { enumerable: true, get: function () { return error_1.StockFetchFailedError; } });
