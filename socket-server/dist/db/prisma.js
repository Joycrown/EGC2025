"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const isProd = process.env.APP_ENV === 'production';
const dbUrl = isProd ? process.env.PROD_DATABASE_URL : process.env.DATABASE_URL;
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        datasources: { db: { url: dbUrl } },
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
