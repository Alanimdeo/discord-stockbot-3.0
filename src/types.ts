import { appendFileSync } from "fs";
import {
  Client,
  ClientOptions,
  Collection,
  ColorResolvable,
  ChatInputCommandInteraction,
  EmbedBuilder,
  EmbedFooterData,
  Message,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export class Bot extends Client {
  commands: Collection<string, Command>;
  adminCommands: Collection<string, AdminCommand>;
  corpList: CorpList;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection<string, Command>();
    this.adminCommands = new Collection<string, AdminCommand>();
    this.corpList = {};
  }
}

export interface CorpList {
  [corpName: string]: string;
}

export class Command {
  data: CommandData;
  execute: (
    interaction: ChatInputCommandInteraction,
    bot: Bot
  ) => Promise<void>;

  constructor(
    data: CommandData,
    execute: (
      interaction: ChatInputCommandInteraction,
      bot: Bot
    ) => Promise<void>
  ) {
    this.data = data;
    this.execute = execute;
  }
}

export type CommandData =
  | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
  | SlashCommandSubcommandsOnlyBuilder;

export class AdminCommand {
  data: AdminCommandData;
  execute: (message: Message, bot: Bot) => Promise<void>;

  constructor(
    data: AdminCommandData,
    execute: (message: Message, bot: Bot) => Promise<void>
  ) {
    this.data = data;
    this.execute = execute;
  }
}

export type AdminCommandData = {
  name: string;
  command: string;
};

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
  const embed = new EmbedBuilder();
  embed.setColor(option.color);
  embed.setTitle(
    option.icon ? `:${option.icon}: ${option.title}` : option.title
  );
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

export function errorLog(err: unknown, caller: string) {
  appendFileSync(
    "./error.log",
    `[${new Date().toLocaleString()}] - ${caller}\n${String(err)}\n\n`
  );
}
