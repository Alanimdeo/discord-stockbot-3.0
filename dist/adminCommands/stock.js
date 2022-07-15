"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const database_1 = require("../modules/database");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("stock").setDescription("주식"), async (message, bot) => {
    try {
        let command = message.content.split(" ");
        command.shift();
        command.shift();
        if (isNaN(Number(command[0]))) {
            switch (command[0].toLowerCase()) {
                case "fetch":
                    if (isNaN(Number(command[1]))) {
                        const corpName = Object.keys(bot.corpList).find((corpName) => corpName.toLowerCase() == command[1].toLowerCase());
                        if (corpName) {
                            await message.reply(bot.corpList[corpName]);
                        }
                        else {
                            await message.reply("Not Found");
                        }
                    }
                    else {
                        const code = Object.values(bot.corpList).find((code) => code == command[1]);
                        if (code) {
                            await message.reply(Object.keys(bot.corpList)[Object.values(bot.corpList).indexOf(code)]);
                        }
                        else {
                            await message.reply("Not Found");
                        }
                    }
            }
        }
        else {
            const userdata = await (0, database_1.getUserdata)(command[0]);
            switch (command[1].toLowerCase()) {
                case "set":
                    await userdata.stock.setStock(command[2], Number(command[3]), Number(command[4]));
                    break;
                case "add":
                    await userdata.stock.addStock(command[2], Number(command[3]), Number(command[4]));
                    break;
                case "reduce":
                    await userdata.stock.reduceStock(command[2], Number(command[3]), Number(command[4]));
                    break;
                case "remove":
                    await userdata.stock.removeStock(command[2]);
            }
            await message.reply("```json\n" + JSON.stringify(userdata.stock.status, null, 2) + "```");
        }
    }
    catch (err) {
        await message.reply("```json\n" + String(err) + "```");
    }
});
