"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const types_1 = require("../types");
const database_1 = require("../modules/database");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("eval").setDescription("명령 실행"), async (message, bot) => {
    try {
        const database = {
            getUserdata: database_1.getUserdata,
            verifyUser: database_1.verifyUser,
        };
        let command = message.content.split(" ");
        command.shift();
        command.shift();
        let result = await eval(`(async () => {${command.join(" ")}})()`);
        console.log(result);
        if (typeof result === "object")
            result = JSON.stringify(result, undefined, 2);
        message.reply("```" + String(result) + "```");
    }
    catch (err) {
        message.reply("```" + String(err) + "```");
        console.error(err);
    }
});
