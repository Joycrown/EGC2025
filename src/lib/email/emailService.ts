import {
  verificationEmailTemplate,
  welcomeEmailTemplate,
  scheduleChangeEmailTemplate,
  gameInviteEmailTemplate,
} from './emailTemplates';
import { sendEmailViaBrevoApi } from './brevoApiService';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email. All app email goes through the Brevo REST API (one key:
 * BREVO_API_KEY), so there is a single place to configure and a single place
 * where failures are logged — including in production.
 * @returns Promise<boolean> True if email was sent successfully
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  return sendEmailViaBrevoApi(options);
}

/**
 * Send email asynchronously (fire and forget)
 * @param options Email options (to, subject, html)
 */
export async function sendEmailAsync({ to, subject, html }: EmailOptions): Promise<void> {
  await sendEmail({ to, subject, html });
}

export function generateVerificationEmail(to: string, token: string): EmailOptions {
  // Get the appropriate base URL based on environment
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // If we're in production environment, use the production URL
  if (process.env.APP_ENV === 'production' && process.env.NEXT_PUBLIC_PRODUCTION_URL) {
    baseUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL;
  }
  
  const verificationLink = `${baseUrl}/verify-email?token=${token}`;
  return {
    to,
    subject: 'Verify your email for EGC Conference 2026',
    html: verificationEmailTemplate(verificationLink, new Date().getFullYear()),
  };
}

export function generatePasswordResetEmail(to: string, token: string): EmailOptions {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  
  return {
    to,
    subject: 'Reset your password for EGC Conference',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e53e3e;">EGC Conference Password Reset</h2>
        <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
        <p>Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also click on the following link or paste it into your browser:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this password change, please ignore this email and your password will remain unchanged.</p>
        <p>This link is valid for 1 hour.</p>
        <hr style="border: 1px solid #f3f4f6; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} The Gospel Faith Mission International - EGC Conference.</p>
      </div>
    `,
  };
}

export function generateScheduleChangeEmail(
  to: string,
  data: {
    gameTypeLabel: string;
    teamAName: string;
    teamBName: string;
    newDate: string;
    newTime: string;
    gameUrl: string;
  }
): EmailOptions {
  return {
    to,
    subject: `Schedule Update: ${data.teamAName} vs ${data.teamBName} — EGC 2026 Games`,
    html: scheduleChangeEmailTemplate({ ...data, year: new Date().getFullYear() }),
  };
}

export function generateGameInviteEmail(
  to: string,
  data: {
    participantName: string;
    gameTypeLabel: string;
    yourTeamName: string;
    opponentTeamName: string;
    scheduledDate: string;
    scheduledTime: string;
    roundNumber: number;
    gameRoomUrl: string;
  }
): EmailOptions {
  return {
    to,
    subject: `You're Playing! ${data.gameTypeLabel} — EGC 2026 Games`,
    html: gameInviteEmailTemplate({ ...data, year: new Date().getFullYear() }),
  };
}

// Get WhatsApp link based on team name
function getWhatsAppLinkByTeam(teamName: string): string {
  const whatsappLinks: Record<string, string> = {
    'Bethel': process.env.WHATSAPP_LINK_BETHEL || 'https://chat.whatsapp.com/example-bethel-link',
    'Judah': process.env.WHATSAPP_LINK_JUDAH || 'https://chat.whatsapp.com/example-judah-link',
    'Salem': process.env.WHATSAPP_LINK_SALEM || 'https://chat.whatsapp.com/example-salem-link',
    'Shiloh': process.env.WHATSAPP_LINK_SHILOH || 'https://chat.whatsapp.com/example-shiloh-link',
  };
  
  return whatsappLinks[teamName] || whatsappLinks['Bethel'];
}

// Welcome email after verification
export function generateWelcomeEmail(email: string, userData: {
  fullName: string;
  role: string;
  teamName: string;
  userId: string;
}): EmailOptions {
  const whatsappLink = getWhatsAppLinkByTeam(userData.teamName);
  
  return {
    to: email,
    subject: `Welcome to EGC Conference 2026, ${userData.fullName}!`,
    html: welcomeEmailTemplate(userData, whatsappLink, new Date().getFullYear()),
  };
}
