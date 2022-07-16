import { Message } from "discord.js";
import { getUserdata } from "../modules/database";
import { AdminCommand, Bot } from "../types";

module.exports = new AdminCommand({ name: "돈", command: "money" }, async (message: Message, bot: Bot) => {
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
  const userdata = await getUserdata(id);
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
