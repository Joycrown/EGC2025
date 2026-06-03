import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prismaClient';

export async function GET(request: NextRequest) {
  try {
    await verifyAuth(request);
    const teams = await prisma.team.findMany({
      select: { id: true, name: true, color: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ teams });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('Unauthorized')) return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
