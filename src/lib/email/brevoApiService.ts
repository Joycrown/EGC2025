import { EmailOptions } from './emailService';
import { verificationEmailTemplate, welcomeEmailTemplate, passwordResetEmailTemplate } from './emailTemplates';

/**
 * Gets the Brevo API key from environment variables
 * @returns The API key
 */
function getApiKey() {
  const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_APP_PASSWORD;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not defined in environment variables');
  }
  if (!apiKey.startsWith('xkeysib-')) {
    // eslint-disable-next-line no-console
    console.error('Brevo API key must start with "xkeysib-". Check your BREVO_API_KEY env var — you may have set an SMTP password instead of the REST API key.');
  }
  return apiKey;
}

/**
 * Send email using Brevo API directly with fetch
 * @param options Email options (to, subject, html)
 * @returns Promise<boolean> True if email was sent successfully
 */
export async function sendEmailViaBrevoApi(options: EmailOptions): Promise<boolean> {
  try {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      // Send email to recipient
    }
    
    const apiKey = getApiKey();
    const senderEmail = process.env.EMAIL_USER || 'no-reply@gofamintpsakure.org';
    
    // Prepare the request payload for Brevo API
    const payload = {
      sender: {
        name: 'Gofamint Pace Setters Akure',
        email: senderEmail
      },
      to: [{
        email: options.to,
        name: options.to.split('@')[0] // Use part before @ as name
      }],
      subject: options.subject,
      htmlContent: options.html
    };
    
    // Send the API request to Brevo
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });
    
    // Parse the response
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.status} ${response.statusText} - ${JSON.stringify(data)}`);
    }
    
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error sending email via Brevo API:',
      error instanceof Error ? error.message : error);
    return false;
  }
}

// Functions to mirror the emailService.ts interface
// Send verification email using Brevo API
export async function sendVerificationEmailViaApi(
  to: string, 
  token: string, 
  _fullName?: string // Prefix with underscore to mark as intentionally unused
): Promise<boolean> {
  // Get the appropriate base URL based on environment
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // If we're in production environment, use the production URL
  if (process.env.APP_ENV === 'production' && process.env.NEXT_PUBLIC_PRODUCTION_URL) {
    baseUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL;
  }
  
  const verificationLink = `${baseUrl}/verify-email?token=${token}`;
  
  // Use the updated verification email template
  const currentYear = new Date().getFullYear();
  const htmlContent = verificationEmailTemplate(verificationLink, currentYear);
  
  return sendEmailViaBrevoApi({
    to,
    subject: 'Verify your email for EGC Conference 2026',
    html: htmlContent
  });
}

// Send welcome email using Brevo API
export async function sendWelcomeEmailViaApi(
  email: string, 
  userData: {
    fullName: string;
    role: string;
    teamName: string;
    userId: string;
  }
): Promise<boolean> {
  // Get WhatsApp link based on team name
  const whatsappLinkKey = `WHATSAPP_LINK_${userData.teamName.toUpperCase()}`;
  const teamWhatsappLink = process.env[whatsappLinkKey] || 'https://chat.whatsapp.com/default';
  
  // Use the updated welcome email template with all required parameters
  const currentYear = new Date().getFullYear();
  const htmlContent = welcomeEmailTemplate(userData, teamWhatsappLink, currentYear);
  
  return sendEmailViaBrevoApi({
    to: email,
    subject: `Welcome to EGC Conference 2026, ${userData.fullName}!`,
    html: htmlContent
  });
}

// Send password reset email using Brevo API
export async function sendPasswordResetEmailViaApi(
  email: string,
  resetToken: string
): Promise<boolean> {
  // Get the appropriate base URL based on environment
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // If we're in production environment, use the production URL
  if (process.env.APP_ENV === 'production' && process.env.NEXT_PUBLIC_PRODUCTION_URL) {
    baseUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL;
  }
  
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
  
  // Use the password reset email template
  const currentYear = new Date().getFullYear();
  const htmlContent = passwordResetEmailTemplate(resetLink, currentYear);
  
  return sendEmailViaBrevoApi({
    to: email,
    subject: 'Reset Your EGC Conference 2026 Password',
    html: htmlContent
  });
}
