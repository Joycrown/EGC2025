import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { Role, Prisma } from '@prisma/client';
import { verifyAuth } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    await verifyAuth(request, [Role.ADMIN, Role.SUPER_ADMIN]);

    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchTerm = searchParams.get('searchTerm') || '';
    const roleFilter = searchParams.get('roleFilter');

    if (!day || !['day1', 'day2', 'day3'].includes(day)) {
      return NextResponse.json({ error: 'Invalid or missing day parameter' }, { status: 400 });
    }

    const skip = (page - 1) * pageSize;

    const whereClause: Prisma.AttendanceWhereInput = {
      [day]: true,
      ...(searchTerm && {
        User: {
          OR: [
            { fullName: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      }),
      ...(roleFilter && roleFilter !== 'ALL' && {
        User: { role: roleFilter as Role },
      }),
    };

    const [attendance, totalAttendees] = await prisma.$transaction([
      prisma.attendance.findMany({
        where: whereClause,
        select: {
          id: true,
          User: {
            select: {
              fullName: true,
              email: true,
              role: true,
              address: true,
            },
          },
        },
        orderBy: { User: { fullName: 'asc' } },
        skip,
        take: pageSize,
      }),
      prisma.attendance.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      attendees: attendance,
      totalAttendees,
      totalPages: Math.ceil(totalAttendees / pageSize),
    });

  } catch (error) {
    console.error('Fetch Attendance Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message.includes('Forbidden')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
