import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Add connect_timeout to avoid long hangs when DB is unreachable
function buildDatasourceUrl() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) return undefined;
  const sep = url.includes("?") ? "&" : "?";
  return url.includes("connect_timeout") ? url : `${url}${sep}connect_timeout=5`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatasourceUrl(),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
