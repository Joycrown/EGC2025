import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { Role, Prisma } from '@prisma/client';
import { verifyAuth } from '@/lib/auth/utils';


export async function GET(request: NextRequest) {
  try {
    await verifyAuth(request, [Role.ADMIN, Role.SUPER_ADMIN]);
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          userType: true,
          phoneNumber: true,
          address: true
        },
      });
      return NextResponse.json(user ? [user] : []);
    }
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchTerm = searchParams.get('searchTerm') || '';
    const roleFilter = searchParams.get('roleFilter');

    const skip = (page - 1) * pageSize;

    const whereClause: Prisma.UserWhereInput = {
      ...(searchTerm && {
        OR: [
          { fullName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ],
      }),
      ...(roleFilter && roleFilter !== 'ALL' && {
        role: roleFilter as Role,
      }),
    };

    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          gender: true,
          isVerified: true,
          address: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / pageSize),
    });

  } catch (error: unknown) {
    console.error('Get/Search Users Error:', error);
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

