import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, setVerificationToken } from '@/lib/auth/userService';
import { generateVerificationToken } from '@/lib/auth/utils';
import { sendEmail, generateVerificationEmail } from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    // Get user data from request body
    const userData = await request.json();
    
    // Validate required fields
    const requiredFields = ['email', 'password', 'fullName', 'birthDate', 'birthMonth', 'gender'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Check if user with this email already exists
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create new user
    const user = await createUser(userData);
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    
    // Save verification token to user
    await setVerificationToken(user.id, verificationToken);
    
    // For debugging in development environment
    if (process.env.NODE_ENV !== 'production') {
      // Safely log verification information during development
      // These logs are suppressed in production
      const logVerificationInfo = () => {
        // Get the appropriate base URL based on environment
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        if (process.env.APP_ENV === 'production' && process.env.NEXT_PUBLIC_PRODUCTION_URL) {
          baseUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL;
        }
        
        // eslint-disable-next-line no-console
        console.log(`Verification token for ${user.email}: ${verificationToken}`);
        // eslint-disable-next-line no-console
        console.log(`Verification URL: ${baseUrl}/verify-email?token=${verificationToken}`);
      };
      
      // Only execute in development
      logVerificationInfo();
    }
    
    // Send verification email
    await sendEmail(generateVerificationEmail(
      user.email,
      verificationToken
    ));
    
    // Return success response (exclude password from response)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: userWithoutPassword,
      redirectUrl: '/registration-success?email=' + encodeURIComponent(user.email)
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
