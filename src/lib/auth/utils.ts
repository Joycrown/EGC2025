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
export const generateToken = (payload: TokenPayload, expiresIn: string | number = '7d'): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  // TypeScript will complain about the type of expiresIn, but this is correct according to the jsonwebtoken docs
  // @ts-expect-error - The 'expiresIn' parameter type is string | number in jsonwebtoken library
  return sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  // This is a safe cast since we know the structure of our JWT tokens
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
