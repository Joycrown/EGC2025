import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, setPasswordResetToken } from '@/lib/auth/userService';
import { generateResetToken } from '@/lib/auth/utils';
import { sendPasswordResetEmailViaApi } from '@/lib/email/brevoApiService';

export async function POST(request: NextRequest) {
  try {
    // Get email from request body
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await findUserByEmail(email);
    
    // If user doesn't exist, we still return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }
    
    // Generate reset token
    const resetToken = generateResetToken();
    
    // Set expiry time to 1 hour from now
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1);
    
    // Save reset token and expiry time to user
    await setPasswordResetToken(user.id, resetToken, expiryTime);
    
    // Send password reset email via Brevo API
    const emailSent = await sendPasswordResetEmailViaApi(
      user.email!,
      resetToken
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again later.' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      message: 'If an account with this email exists, a password reset link has been sent.'
    });
    
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
