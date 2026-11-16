import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, setVerificationToken } from '@/lib/auth/userService';
import { generateVerificationToken } from '@/lib/auth/utils';
import { sendVerificationEmailViaApi } from '@/lib/email/brevoApiService';

// Same reply whether or not the account exists, so this can't be used to
// discover who has registered.
const GENERIC_MESSAGE =
  'If an unverified account with this email exists, a new verification link has been sent.';

// Basic protection against hammering one inbox (per server instance)
const COOLDOWN_MS = 60 * 1000;
const lastSentAt = new Map<string, number>();

// POST { email } — re-send the email verification link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user || user.isVerified || !user.email) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    const key = user.email.toLowerCase();
    const now = Date.now();
    if (now - (lastSentAt.get(key) ?? 0) < COOLDOWN_MS) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    // Keep the existing token so a link from an earlier email still works
    let token = user.verificationToken;
    if (!token) {
      token = generateVerificationToken();
      await setVerificationToken(user.id, token);
    }

    const sent = await sendVerificationEmailViaApi(user.email, token, user.fullName);
    if (!sent) {
      return NextResponse.json(
        { error: "We couldn't send the email right now. Please try again in a few minutes." },
        { status: 503 }
      );
    }

    lastSentAt.set(key, now);
    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
