import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { verifyAuth } from '@/lib/auth/utils';

// GET — all conference editions (newest first), for year pickers in the admin UI
export async function GET(request: NextRequest) {
  try {
    await verifyAuth(request, ['ADMIN', 'SUPER_ADMIN']);

    const editions = await prisma.conferenceEdition.findMany({
      orderBy: { year: 'desc' },
      select: { id: true, year: true, name: true, isActive: true, startDate: true, endDate: true },
    });

    return NextResponse.json({ editions });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('Unauthorized')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (msg.includes('Forbidden')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('Fetch editions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
