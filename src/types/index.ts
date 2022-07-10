import { Client, ClientOptions, Collection, ColorResolvable, EmbedFooterData, MessageEmbed } from "discord.js";
import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";

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
  data: CommandData;
  execute: Function;

  constructor(data: CommandData, execute: Function) {
    this.data = data;
    this.execute = execute;
  }
}

export type CommandData =
  | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
  | SlashCommandSubcommandsOnlyBuilder;

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

export { User } from "./user";

export { errorLog, NotFoundError, StockFetchFailedError } from "./error";
