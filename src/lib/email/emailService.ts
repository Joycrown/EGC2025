/* eslint-disable @typescript-eslint/no-unused-vars */
import nodemailer from 'nodemailer';
import { verificationEmailTemplate, welcomeEmailTemplate } from './emailTemplates';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create reusable transporter object using SMTP transport
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD, // App password, not regular password
    },
  });
}

// Send email using the configured transporter
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Create transporter
    const transporter = createTransporter();

    // Setup email data
    const mailOptions = {
      from: `"EGC Conference" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    // Send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendEmailAsync({ to, subject, html }: EmailOptions): Promise<void> {
  if (process.env.NODE_ENV !== 'production') { /* empty */ }
  await sendEmail({ to, subject, html });
}

export function generateVerificationEmail(to: string, token: string): EmailOptions {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  return {
    to,
    subject: 'Verify your email for EGC Conference 2025',
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
    subject: `Welcome to EGC Conference 2025, ${userData.fullName}!`,
    html: welcomeEmailTemplate(userData, whatsappLink, new Date().getFullYear()),
  };
}
