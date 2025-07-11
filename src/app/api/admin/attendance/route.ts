import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { Role } from '@prisma/client';
import { verifyAuth } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    await verifyAuth(request, [Role.ADMIN, Role.SUPER_ADMIN]);

    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');

    if (!day || !['day_11_july', 'day_12_july', 'day_13_july'].includes(day)) {
      return NextResponse.json({ error: 'Invalid or missing day parameter' }, { status: 400 });
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        [day]: true,
      },
      select: {
        id: true,
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          fullName: 'asc',
        },
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Fetch Attendance Error:', error);
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
