import { SlashCommandBuilder } from "@discordjs/builders";
import { Message } from "discord.js";
import { getUserdata } from "../modules/database";
import { Bot, Command } from "../types";

module.exports = new Command(
  new SlashCommandBuilder().setName("money").setDescription("돈"),
  async (message: Message, bot: Bot) => {
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
    const userdata = await getUserdata(id);
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
  }
);
