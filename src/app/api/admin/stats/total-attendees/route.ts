import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { Role } from '@prisma/client';
import { verifyAuth } from '@/lib/auth/utils';
import { getActiveEdition } from '@/lib/editions/activeEdition';

// Unique attendees for the current conference edition only.
// (Attendance is unique per user per edition, so one row = one person.)
export async function GET(request: NextRequest) {
  try {
    await verifyAuth(request, [Role.ADMIN, Role.SUPER_ADMIN]);

    const edition = await getActiveEdition();
    if (!edition) {
      return NextResponse.json({ totalAttendees: 0, editionName: null });
    }

    const totalAttendees = await prisma.attendance.count({
      where: {
        editionId: edition.id,
        OR: [{ day1: true }, { day2: true }, { day3: true }],
      },
    });

    return NextResponse.json({ totalAttendees, editionName: edition.name });

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
