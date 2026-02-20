import prisma from "./prisma";

const optionsCache = new Map<string, { value: string; expiry: number }>();
const CACHE_TTL = 60_000; // 1 minute

export async function getOption(
  name: string,
  defaultValue: string = ""
): Promise<string> {
  const cached = optionsCache.get(name);
  if (cached && cached.expiry > Date.now()) {
    return cached.value;
  }

  try {
    const option = await prisma.general_options.findFirst({
      where: { name },
    });

    const value = option?.value ?? defaultValue;
    optionsCache.set(name, { value, expiry: Date.now() + CACHE_TTL });
    return value;
  } catch (error) {
    console.error(`[options] Failed to fetch option "${name}":`, error);
    return defaultValue;
  }
}

export async function getOptions(
  names: string[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const toFetch: string[] = [];

  for (const name of names) {
    const cached = optionsCache.get(name);
    if (cached && cached.expiry > Date.now()) {
      result[name] = cached.value;
    } else {
      toFetch.push(name);
    }
  }

  if (toFetch.length > 0) {
    try {
      const options = await prisma.general_options.findMany({
        where: { name: { in: toFetch } },
      });

      for (const opt of options) {
        if (opt.name) {
          result[opt.name] = opt.value ?? "";
          optionsCache.set(opt.name, {
            value: opt.value ?? "",
            expiry: Date.now() + CACHE_TTL,
          });
        }
      }
    } catch (error) {
      console.error(`[options] Failed to fetch options:`, error);
    }

    for (const name of toFetch) {
      if (!(name in result)) {
        result[name] = "";
      }
    }
  }

  return result;
}
