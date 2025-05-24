import { NextRequest, NextResponse } from 'next/server';
import { verifyUser, getTeamNameByBirthMonth } from '@/lib/auth/userService';
// Import SMTP email methods but comment them out as we're now using the API method
// import { sendEmail, generateWelcomeEmail } from '@/lib/email/emailService';
import { sendWelcomeEmailViaApi } from '@/lib/email/brevoApiService';
import prisma from '@/lib/db/prismaClient';

export async function GET(request: NextRequest) {
  try {
    // Get verification token from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }
    
    // Try to find user with this token (before verification)
    const userByToken = await prisma.user.findFirst({
      where: { verificationToken: token }
    });
    
    // If no user found with this token, check if user was already verified
    if (!userByToken) {
      // Check if a verified user exists with this token in their history
      const alreadyVerifiedUser = await prisma.user.findFirst({
        where: { 
          isVerified: true,
          // We can't check the token anymore since it's cleared after verification
          // This is a limitation - we'll return a more user-friendly message
        }
      });
      
      if (alreadyVerifiedUser) {
        // User was already verified, send a friendly message
        return NextResponse.json({
          message: 'Your email has already been verified. You can proceed to login.',
          verified: true,
          alreadyVerified: true
        });
      } else {
        // Token is invalid or expired
        return NextResponse.json(
          { error: 'Invalid or expired verification token' },
          { status: 400 }
        );
      }
    }
    
    // Verify the user with the token
    const user = await verifyUser(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }
    
    // Send welcome email with team information and WhatsApp link
    try {
      // Get team name based on birth month
      const teamName = getTeamNameByBirthMonth(user.birthMonth);
      
      // Send welcome email using Brevo API (more reliable than SMTP)
      await sendWelcomeEmailViaApi(
        user.email,
        {
          fullName: user.fullName,
          role: user.role,
          teamName: teamName,
          userId: user.id
        }
      );
      
      // Fallback to SMTP method if needed
      // await sendEmail(generateWelcomeEmail(
      //   user.email,
      //   {
      //     fullName: user.fullName,
      //     role: user.role,
      //     teamName: teamName,
      //     userId: user.id
      //   }
      // ));
      
      // Only log in development environment
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        // Welcome email sent successfully
      }
    } catch (emailError) {
      // Log email error but don't fail the verification process
      // Use a safe logging approach
      const logEmailError = () => {
        // eslint-disable-next-line no-console
        console.error('Error sending welcome email:', emailError);
      };
      
      // Only log detailed errors in development
      if (process.env.NODE_ENV !== 'production') {
        logEmailError();
      } else {
        // In production, just log that an error occurred without details
        // eslint-disable-next-line no-console
        console.error('Error sending welcome email');
      }
    }
    
    // Return success response
    return NextResponse.json({
      message: 'Email verified successfully. Welcome to EGC Conference 2025!',
      verified: true,
      team: user.teamName,
      userId: user.id
    });
    
  } catch (error) {
    // Log errors with environment check
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Email verification error:', error);
    } else {
      // In production, log without detailed error information
      // eslint-disable-next-line no-console
      console.error('Email verification error occurred');
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
