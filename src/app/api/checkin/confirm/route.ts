import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { verifyCheckinToken } from '@/lib/qr/token';
import { getActiveEdition } from '@/lib/editions/activeEdition';

export async function POST(request: NextRequest) {
  try {
    const { userId, token } = await request.json();
    if (!userId || !token) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const tokenResult = verifyCheckinToken(token);
    if (!tokenResult.valid) return NextResponse.json({ error: tokenResult.error }, { status: 400 });

    const activeEdition = await getActiveEdition();
    if (!activeEdition) return NextResponse.json({ error: 'No active conference edition' }, { status: 400 });

    const day = tokenResult.token!.day;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, role: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await prisma.attendance.upsert({
      where: { userId_editionId: { userId, editionId: activeEdition.id } },
      update: { [day]: true },
      create: {
        userId,
        editionId: activeEdition.id,
        [day]: true,
      },
    });

    return NextResponse.json({
      success: true,
      fullName: user.fullName,
      role: user.role,
      day,
      dayLabel: tokenResult.token!.day,
    });
  } catch (err) {
    console.error('Confirm check-in error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
