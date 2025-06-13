import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { Role } from '@prisma/client';
import { verifyAuth } from '@/lib/auth/utils';
import { z } from 'zod';

const markAttendanceSchema = z.object({
  userIds: z.array(z.string()).min(1, 'At least one user ID is required.'),
  conferenceDay: z.enum(['day_11_july', 'day_12_july', 'day_13_july']),
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

        // Update the attendance records for the selected users
    const updateResult = await prisma.attendance.updateMany({
      where: {
        userId: { in: userIds },
      },
      data: {
        [conferenceDay]: true,
      },
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ message: 'No attendance records found for the selected users. They may need to be registered first.' }, { status: 404 });
    }

    return NextResponse.json({ message: `Successfully marked ${updateResult.count} user(s) as present for ${conferenceDay}.` }, { status: 200 });

  } catch (error: unknown) {
    console.error('Mark Attendance Error:', error);
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

