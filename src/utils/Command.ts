import { Client, Message, Constants, Permission, Embed } from "eris";

type CommandMetadata = {
  name: string;
  description?: string;
  usage?: string;
  aliases?: string[];
  requirements?: Array<keyof Constants["Permissions"]>;
  delete?: boolean;
};
export type CreateCommandModule = {
  default: (client: Client) => { new(): Command }
};
export interface ICommand {
  metadata: CommandMetadata;
  readonly client: Client;
  execute: (message: Message, ...args: string[]) => Promise<any | void>;
  precondition?: (permissions: Permission) => Promise<boolean | string | Embed>;
}
export class Command implements ICommand {
  private _metadata: CommandMetadata;
  public readonly client: Client;
  get metadata() {
    return this._metadata;
  }
  constructor(metadata: CommandMetadata, client: Client) {
    this._metadata = metadata;
    this.client = client;
  }

  async execute(message: Message, ...args: string[]) {}
  // async precondition(permissions: Permission) {}
}
