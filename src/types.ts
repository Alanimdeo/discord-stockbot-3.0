import { appendFileSync } from "fs";
import { Client, ClientOptions, Collection, ColorResolvable, EmbedFooterData, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getToday, getYesterday } from "./modules/time";
import { Lottery } from "./modules/lottery";

export class Bot extends Client {
  commands: Collection<string, Command>;
  adminCommands: Collection<string, Command>;
  corpList: CorpList;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection<string, Command>();
    this.adminCommands = new Collection<string, Command>();
    this.corpList = {};
  }
}

export interface CorpList {
  [corpName: string]: string;
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
  stock: UserStockStatus;
  gold: Asset;
  lottery: Lottery[];
  gamble: GambleInfo;
  lastClaim: string;

  constructor(
    id: string,
    money?: number,
    stock?: UserStockStatus,
    gold?: Asset,
    lottery?: Lottery[],
    gamble?: GambleInfo,
    lastClaim?: string
  ) {
    this.id = id;
    this.money = money || 1_000_000;
    this.stock = stock || {};
    this.gold = gold || { amount: 0, buyPrice: 0 };
    this.lottery = lottery || [];
    this.gamble = gamble || { count: 0, lastPlayed: getToday() };
    this.lastClaim = lastClaim || getYesterday();
  }
}

interface UserStockStatus {
  [code: string]: Asset;
}

interface Asset {
  amount: number;
  buyPrice: number;
}

export interface GambleInfo {
  count: number;
  lastPlayed: string;
}

export interface EmbedOption {
  color: ColorResolvable;
  icon?: string;
  title: string;
  description: string;
  image?: string;
  footer?: EmbedFooterData;
}

export function Embed(option: EmbedOption) {
  const embed = new MessageEmbed();
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

export function errorLog(err: any, caller: string) {
  appendFileSync("./error.log", `[${new Date().toLocaleString()}] - ${caller}\n${String(err)}\n\n`);
}
