import { NextRequest, NextResponse } from 'next/server';
import { findUserByResetToken, updatePassword } from '@/lib/auth/userService';
import { isTokenExpired } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    // Get token and new password from request body
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }
    
    // Find user by reset token
    const user = await findUserByResetToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    // Check if token is expired
    if (user.resetTokenExpiry && isTokenExpired(user.resetTokenExpiry)) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }
    
    // Update password
    await updatePassword(user.id, password);
    
    // Return success response
    return NextResponse.json({
      message: 'Password reset successful'
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
