import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { Role } from '@prisma/client';
import { verifyAuth } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    await verifyAuth(request, [Role.ADMIN, Role.SUPER_ADMIN]);

    const uniqueAttendees = await prisma.attendance.findMany({
      distinct: ['userId'],
    });

    const totalAttendees = uniqueAttendees.length;

    return NextResponse.json({ totalAttendees });

  } catch (error: unknown) {
    console.error('Get Total Attendees Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
