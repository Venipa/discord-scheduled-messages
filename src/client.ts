import { Client } from "eris";
import { CommandHandler } from "./utils/CommandHandler";
import { parseEnvironment } from "./utils/Config";
import Logger from "./utils/Logger";
const log = new Logger("Client");

const memoryStore: { [key: string]: any } = {};

export async function createClient(token: string) {
  memoryStore.token = token;
  const config = parseEnvironment();
  const client = new Client(`${memoryStore.token}`, {
    getAllUsers: false,
    autoreconnect: true,
    seedVoiceConnections: false,
    userAgent: `Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9001 Chrome/83.0.4103.122 Electron/9.3.5 Safari/537.36`
  });
  const commandHandler = new CommandHandler();
  commandHandler.initialize(client, config);
  await commandHandler.loadCommands();
  commandHandler.hookEvent();
  log.debug(config);
  client.on("ready", () => {
    log.debug("Bot is ready, prefix: ", config.prefix);
  });
  await client.connect();
  return client;
}
