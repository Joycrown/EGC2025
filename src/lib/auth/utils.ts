import { sign, verify } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { randomBytes } from 'crypto';

// Types
export interface TokenPayload {
  id: string;
  email: string;
  role: string;
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
export const generateToken = (payload: TokenPayload, expiresIn = '7d'): string => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return verify(token, secret) as TokenPayload;
};

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
