import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { getActiveEdition } from '@/lib/editions/activeEdition';
import { generateEgcUserId } from '@/lib/auth/userService';

const registerSchema = z.object({
  firstName:    z.string().min(1, 'First name is required'),
  lastName:     z.string().min(1, 'Last name is required'),
  email:        z.string().email('Invalid email').optional().or(z.literal('')),
  phone:        z.string().optional(),
  gender:       z.string().min(1, 'Gender is required'),
  memberType:   z.enum(['member', 'invitee', 'minister', 'volunteer', 'participant', 'child']),
  address:      z.string().optional(),
  conferenceDay: z.enum(['day1', 'day2', 'day3']).optional(),
});

const ROLE_MAP: Record<string, Role> = {
  member:      Role.MEMBER,
  invitee:     Role.INVITEE,
  minister:    Role.MINISTER,
  volunteer:   Role.VOLUNTEER,
  participant: Role.PARTICIPANT,
  child:       Role.CHILD,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }

    const { firstName, lastName, email, phone, gender, memberType, address, conferenceDay } = validation.data;
    const isChild = memberType === 'child';

    // For non-children, require at least phone or email
    if (!isChild && !phone?.trim() && !email?.trim()) {
      return NextResponse.json({ error: 'Phone number or email is required for non-children' }, { status: 400 });
    }

    // Check duplicates
    if (email?.trim()) {
      const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
      if (existing) return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }
    if (phone?.trim()) {
      const existing = await prisma.user.findFirst({ where: { phoneNumber: phone.trim() } });
      if (existing) return NextResponse.json({ error: 'A user with this phone number already exists' }, { status: 409 });
    }

    const activeEdition = await getActiveEdition();
    const hashedPassword = await bcrypt.hash(await generateEgcUserId(), 4); // random unusable password
    const userId = await generateEgcUserId();

    const now = new Date();
    const month = now.getMonth(); // July = 6
    const day = now.getDate();

    // Determine which day to auto-mark based on conferenceDay param or today's date
    const dayToMark = conferenceDay ?? (
      month === 6 && day === 10 ? 'day1' :
      month === 6 && day === 11 ? 'day2' :
      month === 6 && day === 12 ? 'day3' : null
    );

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        fullName: `${firstName} ${lastName}`,
        email: email?.trim().toLowerCase() || null,
        phoneNumber: phone?.trim() || null,
        password: hashedPassword,
        gender,
        role: ROLE_MAP[memberType] ?? Role.MEMBER,
        address: address?.trim() || null,
        isVerified: true,
        userType: 'USER',
      },
    });

    // Mark attendance for active edition
    if (activeEdition && dayToMark) {
      await prisma.attendance.create({
        data: {
          userId: newUser.id,
          editionId: activeEdition.id,
          [dayToMark]: true,
        },
      });
    }

    // Create conference registration
    if (activeEdition) {
      await prisma.conferenceRegistration.upsert({
        where: { userId_editionId: { userId: newUser.id, editionId: activeEdition.id } },
        update: {},
        create: { userId: newUser.id, editionId: activeEdition.id },
      });
    }

    return NextResponse.json({
      message: 'Member registered successfully',
      user: { id: newUser.id, fullName: newUser.fullName, role: newUser.role },
      markedDay: dayToMark,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
