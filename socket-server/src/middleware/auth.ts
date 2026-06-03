import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { AuthUser } from '../types';

export function verifySocketToken(socket: Socket): AuthUser {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) throw new Error('No token provided');

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');

  const payload = jwt.verify(token, secret) as jwt.JwtPayload;

  if (!payload.id || !payload.email || !payload.role || !payload.userType) {
    throw new Error('Invalid token payload');
  }

  return {
    id: payload.id as string,
    email: payload.email as string,
    role: payload.role as AuthUser['role'],
    userType: payload.userType as AuthUser['userType'],
  };
}

export function isAdmin(user: AuthUser): boolean {
  return user.userType === 'ADMIN' || user.userType === 'SUPER_ADMIN';
}
