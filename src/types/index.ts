import { Client, ClientOptions, Collection, ColorResolvable, EmbedFooterData, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getToday, getYesterday } from "../modules/time";
import { Lottery } from "../modules/lottery";
import { NegativeNumberError, NotFoundError } from "./error";

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
  stock: UserStock;
  gold: Asset;
  lottery: Lottery[];
  gamble: GambleInfo;
  lastClaim: string;

  constructor(
    id: string,
    money?: number,
    stock?: UserStock,
    gold?: Asset,
    lottery?: Lottery[],
    gamble?: GambleInfo,
    lastClaim?: string
  ) {
    this.id = id;
    this.money = money || 1_000_000;
    this.stock = stock || new UserStock();
    this.gold = gold || { amount: 0, buyPrice: 0 };
    this.lottery = lottery || [];
    this.gamble = gamble || { count: 0, lastPlayed: getToday() };
    this.lastClaim = lastClaim || getYesterday();
  }
}

export class UserStock {
  status: UserStockStatus;
  setStock(code: string, amount: number, buyPrice?: number): UserStock {
    if (amount < 0 || (buyPrice && buyPrice < 0)) {
      throw new NegativeNumberError("The amount or buyPrice of stock cannot be negative.");
    } else if (amount === 0) {
      console.log("If you want to remove stock, use removeStock instead.");
      return this.removeStock(code);
    }
    this.status[code] = {
      amount,
      buyPrice: buyPrice || 1, // 0으로 하면 내주식 명령어 사용 시 수익률이 무한대가 됨
    };
    return this;
  }
  addStock(code: string, amount: number, price: number): UserStock {
    if (amount < 0 || price < 0) {
      throw new NegativeNumberError(
        "Adding negative number using addStock can cause error because it doesn't check if the amount is 0. Use reduceStock or setStock or removeStock instead."
      );
    }
    if (!this.status[code]) {
      this.status[code] = {
        amount,
        buyPrice: price * amount,
      };
    } else {
      this.status[code].amount += amount;
      this.status[code].buyPrice += price * amount;
    }
    return this;
  }
  reduceStock(code: string, amount: number, price: number): UserStock {
    if (amount < 0 || price < 0) {
      throw new NegativeNumberError(
        "Reducing the amount of stock using reduceStock is not recommmended. use addStock instead."
      );
    } else if (!this.status[code]) {
      throw new NotFoundError("The user does not have this stock.");
    }
    this.status[code].amount -= amount;
    this.status[code].buyPrice -= price * amount;
    return this;
  }
  removeStock(code: string): UserStock {
    if (!this.status[code]) {
      throw new NotFoundError("The user does not have this stock.");
    }
    delete this.status[code];
    return this;
  }

  constructor(status: UserStockStatus = {}) {
    this.status = status;
  }
}

export interface UserStockStatus {
  [code: string]: Asset;
}

export interface Asset {
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

export { errorLog, NotFoundError, StockFetchFailedError } from "./error";
