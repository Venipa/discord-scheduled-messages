import { Client, Message, TextChannel } from "eris";
import moment, { Duration } from "moment";
import { Command } from "../utils/Command";
import fs from "fs";
import path from "path";
import Logger from "../utils/Logger";
const durationString = (duration: Duration) =>
  `${duration.asHours().toFixed(0)}h:${duration
    .minutes()
    .toFixed(0)}m:${duration.seconds().toFixed(0)}s`;
export interface Schedule {
  handle?: any;
  interval: string;
  channel: string;
  message: string;
  lastRun?: string;
}
export default function (client: Client) {
  const scheduleStore: { [key: string]: Schedule } = {};
  return class extends Command {
    constructor() {
      super(
        {
          name: "schedule",
          description: "schedule messages",
          usage: `schedule <add/rm/ls/now> <name> [every x(h)our/(m)in/(s)ec] [message]>
          schedule add <name> <every 1hour> <message: checking my homework>
          schedule now <name>
          schedule rm <name>
          schedule ls`,
          delete: true,
        },
        client
      );
      this.loadFromDrive();
    }
    async execute(message: Message, ...[type, ...args]: string[]) {
      await message.channel.sendTyping();
      if (type.toLowerCase() === "add") this.addSchedule(message, ...args);
      else if (type.toLowerCase() === "rm")
        this.removeSchedule(message, ...args);
      else if (type.toLowerCase() === "ls") this.listSchedule(message);
      else if (type.toLowerCase() === "now") this.nowSchedule(message, ...args);
    }
    private onSend(name: string, schedule: Schedule) {
      new Logger(`scheduler:${name}`).debug(schedule);
      (this.client.getChannel(
        schedule.channel
      ) as TextChannel)?.createMessage?.(schedule.message);
      scheduleStore[name].lastRun = new Date().toISOString();
    }
    private addSchedule(message: Message, ...[name, interval, ...m]: string[]) {
      if (scheduleStore[name]) this.removeSchedule(message, ...[name]);
      scheduleStore[name] = {
        interval: `PT${interval.toUpperCase()}`,
        channel: message.channel.id,
        message: m.join(" "),
      };
      scheduleStore[name].handle = setInterval(
        this.onSend.bind(this, name, scheduleStore[name]),
        moment.duration(scheduleStore[name].interval).asMilliseconds()
      );
      this.saveToDrive();
    }
    private removeSchedule(message: Message, ...[name]: string[]) {
      if (!scheduleStore[name]) return;
      clearInterval(scheduleStore[name].handle);
      delete scheduleStore[name];
      this.saveToDrive();
    }
    private nowSchedule(message: Message, ...[name]: string[]) {
      if (!scheduleStore[name]) return;
      if (scheduleStore[name].handle) clearInterval(scheduleStore[name].handle);
      scheduleStore[name].handle = setInterval(
        this.onSend.bind(this, name, scheduleStore[name]),
        moment.duration(scheduleStore[name].interval).asMilliseconds()
      );
      this.onSend(name, scheduleStore[name]);
    }
    private listSchedule(message: Message) {
      const m = Object.entries(scheduleStore).map(([name, entity]) => {
        const duration = moment.duration(entity.interval);
        return (
          `${name}\t\t:: ${entity.channel} - ` +
          (entity.lastRun
            ? `${durationString(
                duration
                  .clone()
                  .subtract(
                    Date.now() - Date.parse(entity.lastRun),
                    "milliseconds"
                  )
              )} / `
            : "") +
          `every ${durationString(duration)}, ${entity.message}`
        );
      });
      message.channel.createMessage(`\`\`\`asciidoc\n${m}\`\`\``);
    }
    private async saveToDrive() {
      const data = JSON.stringify(
        Object.entries(scheduleStore)
          .map(([name, entity]) => {
            return <Schedule & { name: string }>{
              channel: entity.channel,
              interval: entity.interval,
              message: entity.message,
              name,
            };
          })
          .reduce((l, r) => ({ ...l, [r.name]: { ...r, name: undefined } }), {})
      );
      fs.writeFileSync(path.resolve(__dirname, "schedules.json"), data);
    }
    private async loadFromDrive() {
      try {
        Object.entries(
          JSON.parse(
            fs
              .readFileSync(path.resolve(__dirname, "schedules.json"))
              .toString()
          )
        ).forEach(([name, entity]: [string, Schedule]) => {
          scheduleStore[name] = <Schedule>{
            ...entity,
          };
          scheduleStore[name].handle = setInterval(
            this.onSend.bind(this, name, scheduleStore[name]),
            moment.duration(entity.interval).asMilliseconds()
          );
        });
      } catch {}
    }
  };
}
