import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { verifyCheckinToken } from '@/lib/qr/token';
import { getActiveEdition } from '@/lib/editions/activeEdition';
import { generateEgcUserId } from '@/lib/auth/userService';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

const ROLE_MAP: Record<string, Role> = {
  MEMBER:   Role.MEMBER,
  GUEST:    Role.INVITEE,
  MINISTER: Role.MINISTER,
  CHILD:    Role.CHILD,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, email, gender, address, attendeeType, token } = body;

    const tokenResult = verifyCheckinToken(token);
    if (!tokenResult.valid) return NextResponse.json({ error: tokenResult.error }, { status: 400 });

    const isChild = attendeeType === 'CHILD';

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: 'First and last name are required' }, { status: 400 });
    }
    if (!gender) return NextResponse.json({ error: 'Gender is required' }, { status: 400 });
    if (!isChild && !phone?.trim() && !email?.trim()) {
      return NextResponse.json({ error: 'Phone number or email is required' }, { status: 400 });
    }

    // Check for duplicate phone
    if (phone?.trim()) {
      const existing = await prisma.user.findFirst({ where: { phoneNumber: phone.trim() } });
      if (existing) {
        return NextResponse.json({
          error: 'A registration with this phone number already exists. Please use the "Already registered" option.',
          duplicate: true,
        }, { status: 409 });
      }
    }

    // Check for duplicate email
    if (email?.trim()) {
      const existing = await prisma.user.findFirst({ where: { email: email.trim().toLowerCase() } });
      if (existing) {
        return NextResponse.json({
          error: 'A registration with this email already exists. Please use the "Already registered" option.',
          duplicate: true,
        }, { status: 409 });
      }
    }

    const activeEdition = await getActiveEdition();
    const day = tokenResult.token!.day;
    const userId = await generateEgcUserId();
    const randomPassword = await bcrypt.hash(randomBytes(32).toString('hex'), 4);

    const user = await prisma.user.create({
      data: {
        id: userId,
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        email: email?.trim().toLowerCase() || null,
        password: randomPassword,
        phoneNumber: phone?.trim() || null,
        gender,
        address: address?.trim() || null,
        role: ROLE_MAP[attendeeType] ?? Role.MEMBER,
        isVerified: true,
        userType: 'USER',
      },
    });

    // Mark attendance for today
    if (activeEdition) {
      await prisma.attendance.create({
        data: {
          userId: user.id,
          editionId: activeEdition.id,
          [day]: true,
        },
      });

      await prisma.conferenceRegistration.upsert({
        where: { userId_editionId: { userId: user.id, editionId: activeEdition.id } },
        update: {},
        create: { userId: user.id, editionId: activeEdition.id },
      });
    }

    return NextResponse.json({
      success: true,
      fullName: user.fullName,
      userId: user.id,
      role: user.role,
      day,
    }, { status: 201 });
  } catch (err) {
    console.error('Quick register error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
