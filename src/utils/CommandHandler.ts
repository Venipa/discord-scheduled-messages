import { config } from "dotenv/types";
import { Client, Message } from "eris";
import fs from "fs";
import path from "path";
import { CreateCommandModule, ICommand } from "./Command";
import { Config } from "./Config";
import { DiscordEmbed } from "./DiscordEmbed";
import Logger from "./Logger";
const log = new Logger("CommandHandler");
export class CommandHandler {
  private _commands: ICommand[] = [];
  private _client: Client;
  private _config: Config;
  get client() {
    return this._client;
  }
  get commands() {
    return this._commands;
  }
  constructor() {
    this.messageEvent = this.messageEvent.bind(this);
  }

  initialize(client: Client, config: Config) {
    this._client = client;
    this._config = config;
  }

  public async loadCommands() {
    const commandFiles = require.context("../commands", true, /\.ts$/);
    const commands = (await Promise.all(commandFiles
      .keys()
      .map(x => import(x))))
      .map((x: CreateCommandModule) => {
        try {
          return x(this.client);
        } catch {
          return null;
        }
      })
      .filter((x) => !!x)
      .map((x) => new x());
    this._commands = commands;
    log.debug(
      `Loaded ${commands.length}: ${commands
        .map((x) => x.metadata.name)
        .join(", ")}`
    );
  }

  public hookEvent() {
    this._client.on("messageCreate", this.messageEvent);
  }

  public unhookEvent() {
    this._client.off("messageCreate", this.messageEvent);
  }

  private async messageEvent(message: Message) {
    if (!message.member || !this._config.devs.includes(message.author.id)) {
      return;
    }
    const matchesPrefix = message.content
      .toLowerCase()
      .indexOf(this._config.prefix.toLowerCase());
    // Check if there are any commands that match this message
    if (
      matchesPrefix === 0 &&
      (await this.checkCommand(
        message,
        message.content
          .substring(this._config.prefix.length)
          .split(" ")
          .filter((x) => !!x)
      ))
    ) {
    }
  }
  private findCommand(name: string): undefined | ICommand {
    return this.commands.find(
      (com) =>
        com.metadata.name === name || com.metadata.aliases?.includes(name)
    );
  }
  private async checkCommand(message: Message, args: string[]) {
    log.debug(message.content);

    // Starting at 1 index so that it takes away the prefix
    // This makes it easier to later allow custom prefixes for servers, and just check for those too in the if case above
    const commandName = args.shift();
    try {
      const command = this.findCommand(commandName?.toLowerCase());
      if (command) {
        if (
          command.precondition &&
          !command.precondition(message.member.permissions)
        ) {
          throw {
            title: "No permission",
            message: "You don't have permission to use this command",
          };
        }
        if (command.metadata.delete === true) {
          await message.delete();
        }

        await command.execute(message, ...args);

        return true;
      } else {
        return false;
      }
    } catch (e) {
      log.error(e);
    }
  }
}
