import { Client, ClientOptions, Collection } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getToday, getYesterday } from "./modules/time";
import { Lottery } from "./modules/lottery";

export class Bot extends Client {
  commands: Collection<string, Command>;
  adminCommands: Collection<string, Command>;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection<string, Command>();
    this.adminCommands = new Collection<string, Command>();
  }
}

export class Command {
  data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
  execute: Function;

  constructor(data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">, execute: Function) {
    this.data = data;
    this.execute = execute;
  }
}

export class User {
  id: string;
  money: number;
  stock: {
    [code: string]: {
      amount: number;
      buyPrice: number;
    };
  };
  gold: {
    amount: number;
    buyPrice: number;
  };
  lottery: Lottery[];
  gamble: {
    count: number;
    lastPlayed: string;
  };
  lastClaim: string;

  constructor(id: string) {
    this.id = id;
    this.money = 1_000_000;
    this.stock = {};
    this.gold = { amount: 0, buyPrice: 0 };
    this.lottery = [];
    this.gamble = { count: 0, lastPlayed: getToday() };
    this.lastClaim = getYesterday();
  }
}
