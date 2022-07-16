"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const database_1 = require("../modules/database");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("money").setDescription("돈"), async (message, bot) => {
    const command = message.content.split(" ");
    command.shift();
    command.shift();
    const id = command.shift();
    if (!id) {
        return await message.reply("Error: NoId");
    }
    if (isNaN(Number(id))) {
        return await message.reply("Error: IllegalNumber");
    }
    const userdata = await (0, database_1.getUserdata)(id);
    const subcommand = command.shift();
    if (!subcommand) {
        return await message.reply("Error: NoSubcommand");
    }
    const amount = Number(command.shift());
    if (!amount || isNaN(amount)) {
        return await message.reply("Error: IllegalAmount");
    }
    switch (subcommand.toLowerCase()) {
        case "set":
            await userdata.money.setMoney(amount);
            break;
        case "add":
            await userdata.money.addMoney(amount);
            break;
        case "reduce":
            await userdata.money.reduceMoney(amount);
            break;
    }
    await message.reply(`\`${userdata.money.amount.toLocaleString("ko-KR")}\``);
});
