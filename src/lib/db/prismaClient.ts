/* eslint-disable no-console */
/**
 * Prisma Client singleton to handle connections to the database.
 * Automatically switches between local and production databases based on APP_ENV.
 */
import { PrismaClient } from '@prisma/client';

// Determine which database URL to use based on environment
const getDbUrl = () => {
  const isProduction = process.env.APP_ENV === 'production';
  const dbUrl = isProduction 
    ? process.env.PROD_DATABASE_URL || process.env.DATABASE_URL
    : process.env.DATABASE_URL;
  
  // Log which database we're connecting to (only in development)
  if (process.env.NODE_ENV !== 'production') {
    // Database connection to ${isProduction ? 'PRODUCTION' : 'LOCAL'} database
    // Comment out debugging info for production code
  }
  
  return dbUrl;
};

// Create PrismaClient with the dynamic URL
const createPrismaClient = () => {
  const url = getDbUrl();
  
  return new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  });
};

// Create a singleton instance of PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

// Save prisma instance in development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
