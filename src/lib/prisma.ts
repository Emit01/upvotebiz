import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaConnectionFailed: boolean | undefined;
};

// Add connect_timeout to the URL so Prisma fails fast when DB is unreachable
function buildDatasourceUrl() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) return undefined;
  const sep = url.includes("?") ? "&" : "?";
  return url.includes("connect_timeout") ? url : `${url}${sep}connect_timeout=5`;
}

function createPrismaClient() {
  return new PrismaClient({
    datasourceUrl: buildDatasourceUrl(),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Test the DB connection once — returns true if reachable, false otherwise. */
export async function isDatabaseReachable(): Promise<boolean> {
  // If we already know it's down, skip re-checking for a while
  if (globalForPrisma.prismaConnectionFailed) return false;

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return true;
  } catch {
    globalForPrisma.prismaConnectionFailed = true;
    // Reset the flag after 30 s so we retry eventually
    setTimeout(() => {
      globalForPrisma.prismaConnectionFailed = false;
    }, 30_000);
    return false;
  }
}

export default prisma;
