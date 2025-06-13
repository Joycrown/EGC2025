import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient'; // Corrected import path
import { Role, UserType } from '@prisma/client';
import { verifyAuth } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    const { user: requestingUser } = await verifyAuth(request, [Role.SUPER_ADMIN]);

    const { userId, userType: newUserType } = await request.json();

    if (!userId || !newUserType) {
      return NextResponse.json({ error: 'User ID and new user type are required.' }, { status: 400 });
    }

    if (newUserType !== UserType.ADMIN && newUserType !== UserType.USER) {
      return NextResponse.json({ error: 'Invalid target user type specified.' }, { status: 400 });
    }

    if (userId === requestingUser.id) {
      return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 400 });
    }

    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (userToUpdate.userType === UserType.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Cannot change the user type of a Super Admin.' }, { status: 403 });
    }

    if (userToUpdate.userType === newUserType) {
      return NextResponse.json({ error: `User is already a ${newUserType}.` }, { status: 400 });
    }

    // Specific logic for promotion/demotion
    if (newUserType === UserType.ADMIN && userToUpdate.userType !== UserType.USER) {
        return NextResponse.json({ error: 'User must be a USER to be promoted to ADMIN.' }, { status: 400 });
    }
    if (newUserType === UserType.USER && userToUpdate.userType !== UserType.ADMIN) {
        return NextResponse.json({ error: 'User must be an ADMIN to be demoted to USER.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { userType: newUserType as UserType },
      select: { id: true, fullName: true, email: true, role: true, userType: true },
    });

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error: unknown) {
    console.error('Update User Role Error:', error);
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
