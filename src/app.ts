import { config as initEnvironemnt } from "dotenv";
import { createClient } from "./client";
import Logger from "./utils/Logger";
initEnvironemnt();
if (process.env.NODE_ENV === "production") Logger.enableProduction();
const log = new Logger("Client");
(async () => {
  const client = await createClient(process.env.DISCORD_TOKEN);
  log.debug("init");
  client.on("error", (err) => log.error(err));
  client.on("warn", (ev) => log.warn(ev));

})();
