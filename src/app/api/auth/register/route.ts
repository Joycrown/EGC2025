import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, setVerificationToken } from '@/lib/auth/userService';
import { generateVerificationToken } from '@/lib/auth/utils';
import { sendVerificationEmailViaApi } from '@/lib/email/brevoApiService';
import { prisma } from '@/lib/db/prismaClient';
import { getActiveEdition } from '@/lib/editions/activeEdition';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    const requiredFields = ['email', 'password', 'fullName', 'birthDate', 'birthMonth', 'gender'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const user = await createUser(userData);

    const verificationToken = generateVerificationToken();
    await setVerificationToken(user.id, verificationToken);

    // The account is created either way; if the email fails the user can resend it
    // from the success page or the login page.
    const emailSent = await sendVerificationEmailViaApi(user.email!, verificationToken, userData.fullName);
    if (!emailSent) {
      console.error(`Registration: verification email could not be sent for user ${user.id}`);
    }

    // Register for the active conference edition
    const activeEdition = await getActiveEdition();
    if (activeEdition) {
      await prisma.conferenceRegistration.upsert({
        where: { userId_editionId: { userId: user.id, editionId: activeEdition.id } },
        update: {},
        create: { userId: user.id, editionId: activeEdition.id },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({
      message: emailSent
        ? 'User registered successfully. Please check your email to verify your account.'
        : 'User registered successfully, but the verification email could not be sent. Please use "Resend verification email".',
      user: userWithoutPassword,
      emailSent,
      redirectUrl: '/registration-success?email=' + encodeURIComponent(user.email!) + (emailSent ? '' : '&emailSent=0'),
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
