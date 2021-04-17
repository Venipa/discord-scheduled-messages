export interface Config {
  prefix: string;
  devs: string[];
}

export function parseEnvironment(): Config {
  const envMapping: { [key: string]: (keyof Config) | ((key: string, value: string) => any) } = {
    DISCORD_PREFIX: "prefix",
    DISCORD_DEVS: (key, value) => ({ devs: value.split(",") }),
  };
  return Object.entries(process.env)
    .map(([key, value]) => {
      return envMapping[key]
        ? typeof envMapping[key] === "function"
          ? (envMapping[key] as any)(key, value)
          : { [envMapping[key] as string]: value }
        : null;
    })
    .filter((x) => !!x)
    .reduce((l, r) => ({ ...l, ...r }), {}) as any;
}
