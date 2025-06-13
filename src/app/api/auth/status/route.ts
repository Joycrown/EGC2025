import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const secret = process.env.JWT_SECRET;

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!secret) {
    console.error('JWT_SECRET not configured on the server.');
    return NextResponse.json({ error: 'JWT_SECRET not configured' }, { status: 500 });
  }

  if (!token) {
    return NextResponse.json({ isLoggedIn: false });
  }

  try {
    const secretKey = new TextEncoder().encode(secret);
    await jose.jwtVerify(token, secretKey);
    return NextResponse.json({ isLoggedIn: true });
  } catch (error) {
    // Token is invalid or expired
    return NextResponse.json({ isLoggedIn: false });
  }
}
