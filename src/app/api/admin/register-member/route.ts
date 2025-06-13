import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Role } from '@prisma/client';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  gender: z.string().min(1, 'Gender is required'),
  memberType: z.enum(['member', 'invitee', 'minister', 'volunteer', 'participant']),
  address: z.string().min(1, 'Address is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }

    const { firstName, lastName, email, phone, gender, memberType, address } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const memberTypeToRole: { [key: string]: Role } = {
      member: Role.MEMBER,
      invitee: Role.INVITEE,
      minister: Role.MINISTER,
      participant: Role.PARTICIPANT,
      volunteer: Role.VOLUNTEER,
    };

    const role = memberTypeToRole[memberType.toLowerCase()] || Role.PARTICIPANT;

    const newUser = await prisma.user.create({
      data: {
        fullName: `${firstName} ${lastName}`,
        email,
        phoneNumber: phone,
        password: hashedPassword,
        gender,
        role: role,
        address,
      },
    });

    const now = new Date();
    const month = now.getMonth(); // 0-indexed, so July is 6
    const day = now.getDate();

    const attendanceData = {
      userId: newUser.id,
      userEmail: newUser.email,
      day_11_july: month === 6 && day === 11,
      day_12_july: month === 6 && day === 12,
      day_13_july: month === 6 && day === 13,
    };

    await prisma.attendance.create({
      data: attendanceData,
    });

    return NextResponse.json({ message: 'Member registered successfully', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}