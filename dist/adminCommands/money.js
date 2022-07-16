"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../modules/database");
const types_1 = require("../types");
module.exports = new types_1.AdminCommand({ name: "돈", command: "money" }, async (message, bot) => {
    const command = message.content.split(" ");
    command.shift();
    command.shift();
    const id = command.shift();
    if (!id) {
        await message.reply("Error: NoId");
        return;
    }
    if (isNaN(Number(id))) {
        await message.reply("Error: IllegalNumber");
        return;
    }
    const userdata = await (0, database_1.getUserdata)(id);
    const subcommand = command.shift();
    if (!subcommand) {
        await message.reply("Error: NoSubcommand");
        return;
    }
    const amount = Number(command.shift());
    if (!amount || isNaN(amount)) {
        await message.reply("Error: IllegalAmount");
        return;
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
