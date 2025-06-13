import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { Role } from '@prisma/client';
import { verifyAuth } from '@/lib/auth/utils';
import { z } from 'zod';

const updateUserSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  // Add other updatable fields here if needed in the future
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await verifyAuth(request, [Role.ADMIN, Role.SUPER_ADMIN]);
    const { userId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required in path.' }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400 });
    }

    const { fullName, email } = validation.data;

    if (!fullName && !email) {
      return NextResponse.json({ error: 'At least one field (fullName or email) must be provided for update.' }, { status: 400 });
    }

    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Prevent non-SUPER_ADMINs from editing SUPER_ADMINs or themselves if they are an ADMIN
    const { user: requestingUser } = await verifyAuth(request, [Role.ADMIN, Role.SUPER_ADMIN]); // Re-verify to get current user details
    if (userToUpdate.role === Role.SUPER_ADMIN && requestingUser.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Only Super Admins can edit other Super Admins.' }, { status: 403 });
    }
    if (userToUpdate.id === requestingUser.id && requestingUser.role === Role.ADMIN && userToUpdate.role === Role.ADMIN) {
        // Admins cannot edit their own profiles, Super Admins can.
        // This check is a bit redundant if we assume admins go to a separate profile page for self-edits, but good for API robustness.
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(email && { email }),
      },
      select: { id: true, fullName: true, email: true, role: true },
    });

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error: unknown) {
    console.error('Update User Error:', error);
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
