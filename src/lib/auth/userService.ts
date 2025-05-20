import prisma from '../db/prismaClient';
import { hashPassword } from './utils';

// Define types based on our Prisma schema
type User = {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string | null;
  birthDate: number;
  birthMonth: number;
  gender: string;
  isVerified: boolean;
  verificationToken: string | null;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  role: string; // 'ADMIN' | 'COORDINATOR' | 'PARTICIPANT'
  teamId: string | null;
  teamName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Export the User type so other files can use it
export type { User };

// Type for user registration data
export interface RegisterUserData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  birthDate: number;
  birthMonth: number;
  gender: string;
  role?: string; // Added role field
}

// Generate a custom EGC user ID with format EGC25-XXXX (random 4 digits)
export async function generateEgcUserId(): Promise<string> {
  // Generate a random 4-digit number, padded with leading zeros
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  
  // Create ID with format EGC25-XXXX
  const userId = `EGC25-${randomNum.toString().padStart(4, '0')}`;
  
  // Check if this ID already exists (very unlikely but possible)
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  // If ID already exists, recursively try again
  if (existingUser) {
    return generateEgcUserId();
  }
  
  return userId;
}

// Get team name based on birth month
export function getTeamNameByBirthMonth(birthMonth: number): string {
  switch (birthMonth) {
    case 1:
    case 5:
    case 9:
      return 'Bethel';
    case 2:
    case 6:
    case 10:
      return 'Judah';
    case 3:
    case 7:
    case 11:
      return 'Salem';
    case 4:
    case 8:
    case 12:
      return 'Shiloh';
    default:
      return 'Bethel'; // Default to Bethel if invalid month
  }
}

// Get WhatsApp link based on team name
export function getWhatsAppLinkByTeam(teamName: string): string {
  const whatsappLinks: Record<string, string> = {
    'Bethel': process.env.WHATSAPP_LINK_BETHEL || 'https://chat.whatsapp.com/example-bethel-link',
    'Judah': process.env.WHATSAPP_LINK_JUDAH || 'https://chat.whatsapp.com/example-judah-link',
    'Salem': process.env.WHATSAPP_LINK_SALEM || 'https://chat.whatsapp.com/example-salem-link',
    'Shiloh': process.env.WHATSAPP_LINK_SHILOH || 'https://chat.whatsapp.com/example-shiloh-link',
  };
  
  return whatsappLinks[teamName] || whatsappLinks['Bethel'];
}

// Create a new user
export async function createUser(userData: RegisterUserData): Promise<User> {
  const hashedPassword = await hashPassword(userData.password);
  const userId = await generateEgcUserId();
  const teamName = getTeamNameByBirthMonth(userData.birthMonth);
  
  // Create the user without teamName field first
  const user = await prisma.user.create({
    data: {
      id: userId,
      email: userData.email,
      password: hashedPassword,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      birthDate: userData.birthDate,
      birthMonth: userData.birthMonth,
      gender: userData.gender,
      verificationToken: null, // Will be set separately
      role: userData.role || 'PARTICIPANT', // Use role from request or default to PARTICIPANT
    },
  });
  
  // For now, we'll store the teamName in memory and use it when needed
  // We can add a method to store it separately or use it in the email/response
  const userWithTeam = { ...user, teamName };
  return userWithTeam as User;
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

// Find user by ID
export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

// Set verification token
export async function setVerificationToken(userId: string, token: string): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: { verificationToken: token },
  });
}

// Verify user email
export async function verifyUser(token: string): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) return null;

  return prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
    },
  });
}

// Set password reset token
export async function setPasswordResetToken(userId: string, token: string, expiryTime: Date): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: {
      resetToken: token,
      resetTokenExpiry: expiryTime,
    },
  });
}

// Find user by reset token
export async function findUserByResetToken(token: string): Promise<User | null> {
  const now = new Date();
  
  return prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: now,
      },
    },
  });
}

// Update user password
export async function updatePassword(userId: string, newPassword: string): Promise<User> {
  const hashedPassword = await hashPassword(newPassword);
  
  return prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
}

// Assign user to team based on birth month
export async function assignUserToTeam(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { birthMonth: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get team assignment based on birth month
  // Birth months 1-3: Team 1, 4-6: Team 2, 7-9: Team 3, 10-12: Team 4
  const teamNumber = Math.ceil(user.birthMonth / 3);
  
  // Find the team
  const team = await prisma.team.findFirst({
    where: { 
      // This assumes teams are named "Team 1", "Team 2", etc.
      // Adjust as needed based on your actual team naming convention
      name: `Team ${teamNumber}` 
    },
  });

  if (!team) {
    throw new Error(`Team ${teamNumber} not found`);
  }

  // Assign user to the team
  return prisma.user.update({
    where: { id: userId },
    data: { teamId: team.id },
  });
}
