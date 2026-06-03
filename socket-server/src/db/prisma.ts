import { PrismaClient } from '@prisma/client';

const isProd = process.env.APP_ENV === 'production';
const dbUrl = isProd ? process.env.PROD_DATABASE_URL : process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: { db: { url: dbUrl } },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
