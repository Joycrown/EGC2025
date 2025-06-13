import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { NextRequest } from 'next/server';
import { Role, UserType } from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import { randomBytes } from 'crypto';

// Types
export interface TokenPayload extends JWTPayload {
  id: string;
  email: string;
  role: Role;
  userType: UserType;
}

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return hash(password, saltRounds);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return compare(password, hashedPassword);
};

// JWT Token generation and verification
export const generateToken = async (payload: TokenPayload, expiresIn: string | number = '7d'): Promise<string> => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(secret));
};

export const verifyToken = async (token: string): Promise<TokenPayload> => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  return payload as TokenPayload;
};

export async function verifyAuth(request: NextRequest, requiredUserTypes: UserType[] = []) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const user = payload as TokenPayload;

    if (requiredUserTypes.length > 0 && (!user.userType || !requiredUserTypes.includes(user.userType))) {
        throw new Error('Forbidden: You do not have permission to perform this action.');
    }

    return { user };
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Forbidden')) throw err;
    throw new Error('Unauthorized: Invalid token');
  }
}

// Verification token for email verification
export const generateVerificationToken = (): string => {
  return randomBytes(32).toString('hex');
};

// Reset token for password reset
export const generateResetToken = (): string => {
  return randomBytes(32).toString('hex');
};

// Function to check if token is expired
export const isTokenExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};

// Get user session from server-side context
import { cookies } from 'next/headers';

export const getServerSession = async (): Promise<{ user: TokenPayload } | null> => {
  const token = cookies().get('auth-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token);
    return { user: payload };
  } catch (error) {
    console.error('Error verifying token in getServerSession:', error);
    return null;
  }
};
