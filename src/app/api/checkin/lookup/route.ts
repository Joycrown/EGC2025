import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { verifyCheckinToken } from '@/lib/qr/token';
import { getActiveEdition } from '@/lib/editions/activeEdition';

export async function POST(request: NextRequest) {
  try {
    const { search, token } = await request.json();

    if (!search?.trim()) {
      return NextResponse.json({ error: 'Please enter a phone number, email or name' }, { status: 400 });
    }

    // Validate the QR token is still live
    const tokenResult = verifyCheckinToken(token);
    if (!tokenResult.valid) {
      return NextResponse.json({ error: tokenResult.error }, { status: 400 });
    }

    const term = search.trim();

    // "Already checked in" must only look at this year's attendance — a 2025
    // record for the same day doesn't count.
    const activeEdition = await getActiveEdition();

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { phoneNumber: { contains: term } },
          { email: { contains: term, mode: 'insensitive' } },
          { fullName: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        email: true,
        role: true,
        attendances: {
          where: { editionId: activeEdition?.id ?? '__no_active_edition__' },
          select: { day1: true, day2: true, day3: true, editionId: true },
          take: 1,
        },
      },
      take: 5,
    });

    if (users.length === 0) {
      return NextResponse.json({ users: [], notFound: true });
    }

    // Mask sensitive data — show enough to identify without exposing full details
    const safe = users.map(u => ({
      id: u.id,
      fullName: u.fullName,
      role: u.role,
      isChild: u.role === 'CHILD',
      // Show partial phone for identification
      phoneHint: u.phoneNumber ? `***${u.phoneNumber.slice(-4)}` : null,
      emailHint: u.email ? `${u.email[0]}***@${u.email.split('@')[1] ?? ''}` : null,
      // Whether they're already checked in for this day
      alreadyCheckedIn: (() => {
        const att = u.attendances[0];
        if (!att) return false;
        const day = tokenResult.token!.day;
        return att[day] === true;
      })(),
    }));

    return NextResponse.json({ users: safe, notFound: false });
  } catch (err) {
    console.error('Lookup error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
