/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findUserById, getTeamNameByBirthMonth, getWhatsAppLinkByTeam } from '@/lib/auth/userService';
import { verifyToken } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify JWT token
    try {
      const decoded = verifyToken(token);
      
      // Find user by ID from token
      const user = await findUserById(decoded.id);
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Get team name if not already set
      const teamName = user.teamName || getTeamNameByBirthMonth(user.birthMonth);
      
      // Get WhatsApp group link for the team
      const whatsappLink = getWhatsAppLinkByTeam(teamName);
      
      // Return enhanced user data (exclude password)
      const { password, ...userWithoutPassword } = user;
      return NextResponse.json({
        user: {
          ...userWithoutPassword,
          teamName: teamName,
          whatsappLink: whatsappLink
        }
      });
      
    } catch (tokenError) {
      // Token invalid or expired
      cookieStore.delete('auth-token');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
