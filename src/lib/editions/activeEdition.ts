import { prisma } from '@/lib/db/prismaClient';

export interface ActiveEdition {
  id: string;
  year: number;
  name: string;
  startDate: Date;
  endDate: Date;
}

// Cached in-process — the active edition changes at most once a year
let cached: ActiveEdition | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getActiveEdition(): Promise<ActiveEdition | null> {
  const now = Date.now();
  if (cached && now - cachedAt < CACHE_TTL_MS) return cached;

  const edition = await prisma.conferenceEdition.findFirst({
    where: { isActive: true },
    select: { id: true, year: true, name: true, startDate: true, endDate: true },
  });

  cached = edition;
  cachedAt = now;
  return edition;
}

export function invalidateEditionCache() {
  cached = null;
  cachedAt = 0;
}
