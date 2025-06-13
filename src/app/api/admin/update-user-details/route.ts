import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { verifyAuth } from '@/lib/auth/utils';
import { Role } from '@prisma/client';

export async function PUT(request: NextRequest) {
  try {
    const { user: adminUser } = await verifyAuth(request, [Role.ADMIN, Role.SUPER_ADMIN]);

    const body = await request.json();
    
    const { userId, role, phoneNumber, address } = body;

    if (!userId || !role || phoneNumber === undefined || address === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Object.values(Role).includes(role)) {
        return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Security checks: ensure admins can't escalate privileges inappropriately
    if (adminUser.role === Role.ADMIN) {
      if (
        targetUser.role === Role.ADMIN ||
        targetUser.role === Role.SUPER_ADMIN ||
        role === Role.ADMIN ||
        role === Role.SUPER_ADMIN
      ) {
        return NextResponse.json({ error: 'Admins cannot modify other admins or elevate roles to admin level.' }, { status: 403 });
      }
    }

    if (adminUser.role === Role.SUPER_ADMIN) {
        if (targetUser.role === Role.SUPER_ADMIN && targetUser.id !== adminUser.id) {
            return NextResponse.json({ error: 'Super admins cannot modify other super admins.' }, { status: 403 });
        }
        if (role === Role.SUPER_ADMIN && targetUser.id !== adminUser.id) {
            return NextResponse.json({ error: 'Cannot promote other users to Super Admin.' }, { status: 403 });
        }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role as Role,
        phoneNumber: phoneNumber,
        address: address,
      },
    });

    const { password: _password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    console.error('Error updating user:', error);
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
