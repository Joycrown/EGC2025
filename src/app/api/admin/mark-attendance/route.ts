import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { Role } from '@prisma/client';
import { verifyAuth } from '@/lib/auth/utils';
import { getActiveEdition } from '@/lib/editions/activeEdition';
import { z } from 'zod';

const markAttendanceSchema = z.object({
  userIds: z.array(z.string()).min(1, 'At least one user ID is required.'),
  conferenceDay: z.enum(['day1', 'day2', 'day3']),
});

export async function POST(request: NextRequest) {
  try {
    await verifyAuth(request, [Role.ADMIN, Role.SUPER_ADMIN]);

    const body = await request.json();
    const validation = markAttendanceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }

    const { userIds, conferenceDay } = validation.data;

    const activeEdition = await getActiveEdition();
    if (!activeEdition) {
      return NextResponse.json({ error: 'No active conference edition configured' }, { status: 400 });
    }

    const results = [];
    for (const userId of userIds) {
      const record = await prisma.attendance.upsert({
        where: { userId_editionId: { userId, editionId: activeEdition.id } },
        update: { [conferenceDay]: true },
        create: {
          userId,
          editionId: activeEdition.id,
          [conferenceDay]: true,
        },
      });
      results.push(record);
    }

    return NextResponse.json({
      message: `Successfully marked ${results.length} user(s) as present for ${conferenceDay}.`,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Mark Attendance Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message.includes('Forbidden')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
