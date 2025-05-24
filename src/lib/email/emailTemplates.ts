// Email templates with reliable image sources
// This ensures logos and images display properly in email clients

// Import email configuration
import emailConfig from '../../../public/email-assets/email-config.js';

export const verificationEmailTemplate = (verificationLink: string, year: number) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f7fa;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0" style="background-color: #f5f7fa;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!-- Main Email Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" border="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.1);">
          <!-- Header with Logo -->
          <tr>
            <td align="center" bgcolor="#111827" style="padding: 25px 0;">
              <img src="${emailConfig.logoUrl}" alt="GOFAMINT Logo" width="80" style="display: block; margin: 0 auto;">
            </td>
          </tr>
          
          <!-- Banner -->
          <tr>
            <td align="center" bgcolor="#e53e3e" style="padding: 20px; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold;">EGC CONFERENCE 2025</h1>
              <p style="margin: 5px 0 0; font-size: 14px;">Emerging Generals' Conference</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <h2 style="margin: 0 0 20px; color: #111827; font-size: 18px;">Email Verification</h2>
                    <p style="margin: 0 0 15px; color: #4b5563; font-size: 14px; line-height: 1.5;">Thank you for registering for the Emerging Generals' Conference 2025!</p>
                    <p style="margin: 0 0 25px; color: #4b5563; font-size: 14px; line-height: 1.5;">To complete your registration, please verify your email address by clicking the button below:</p>
                  </td>
                </tr>
                
                <!-- Button -->
                <tr>
                  <td align="center" style="padding: 10px 0 25px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" bgcolor="#e53e3e" style="border-radius: 4px;">
                          <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 12px 25px; font-size: 14px; color: #ffffff; font-weight: bold; text-decoration: none;">Verify Email Address</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                
              </table>
            </td>
          </tr>
          
          <!-- Decorative Element -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background-color: #f9fafb; padding: 0 40px;">
                    <div style="height: 2px; background: linear-gradient(90deg, #eab308, #e53e3e, #3b82f6, #8b5cf6); border-radius: 4px;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">THE GOSPEL FAITH MISSION INTERNATIONAL</p>
              <p style="margin: 5px 0 0; color: #9ca3af; font-size: 12px;">&copy; ${year} EGC Conference. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const welcomeEmailTemplate = (userData: {
  fullName: string;
  role: string;
  teamName: string;
  userId: string;
}, whatsappLink: string, year: number) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to EGC Conference 2025</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f7fa;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0" style="background-color: #f5f7fa;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!-- Main Email Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" border="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.1);">
          <!-- Header with Logo -->
          <tr>
            <td align="center" bgcolor="#111827" style="padding: 25px 0;">
              <img src="${emailConfig.logoUrl}" alt="GOFAMINT Logo" width="80" style="display: block; margin: 0 auto;">
            </td>
          </tr>
          
          <!-- Banner -->
          <tr>
            <td align="center" bgcolor="#e53e3e" style="padding: 20px; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold;">EGC CONFERENCE 2025</h1>
              <p style="margin: 5px 0 0; font-size: 14px;">Welcome to Team ${userData.teamName}!</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <h2 style="margin: 0 0 20px; color: #111827; font-size: 18px;">Registration Complete</h2>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 14px; line-height: 1.5;">Thank you for verifying your email. Your registration for the EGC Conference 2025 is now complete!</p>
                    <p style="margin: 0 0 25px; color: #6d28d9; font-size: 16px; font-weight: bold;">Here are your registration details:</p>
                  </td>
                </tr>
                
                <!-- Participant Card -->
                <tr>
                  <td style="padding: 0 0 30px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0" style="border: 1px solid #e5e7eb; border-radius: 4px;">
                      <!-- Card Header -->
                      <tr>
                        <td align="center" bgcolor="#111827" style="padding: 12px; color: #ffffff;">
                          <p style="margin: 0; font-size: 14px; font-weight: bold;">PARTICIPANT DETAILS</p>
                        </td>
                      </tr>
                      
                      <!-- Card Content -->
                      <tr>
                        <td style="padding: 15px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                            <!-- Name -->
                            <tr>
                              <td width="40%" style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb;">
                                <p style="margin: 0; color: #6b7280; font-size: 13px;">Name</p>
                              </td>
                              <td width="60%" style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0; color: #111827; font-weight: bold; font-size: 13px;">${userData.fullName}</p>
                              </td>
                            </tr>
                            
                            <!-- Participant ID -->
                            <tr>
                              <td width="40%" style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb;">
                                <p style="margin: 0; color: #6b7280; font-size: 13px;">ID</p>
                              </td>
                              <td width="60%" style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0; color: #111827; font-size: 13px;">${userData.userId}</p>
                              </td>
                            </tr>
                            
                            <!-- Role -->
                            <tr>
                              <td width="40%" style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb;">
                                <p style="margin: 0; color: #6b7280; font-size: 13px;">Role</p>
                              </td>
                              <td width="60%" style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0; color: #111827; font-weight: bold; font-size: 13px;">${userData.role}</p>
                              </td>
                            </tr>
                            
                            <!-- Team -->
                            <tr>
                              <td width="40%" style="padding: 10px 12px; background-color: #f9fafb;">
                                <p style="margin: 0; color: #6b7280; font-size: 13px;">Team</p>
                              </td>
                              <td width="60%" style="padding: 10px 12px;">
                                <p style="margin: 0; color: #e53e3e; font-weight: bold; font-size: 13px;">Team ${userData.teamName}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- WhatsApp Join -->
                <tr>
                  <td style="padding-bottom: 30px;">
                    <p style="margin: 0 0 15px; color: #4b5563; font-size: 14px; text-align: center;">Join your team's WhatsApp group to connect with fellow team members!</p>
                    <!-- WhatsApp Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td align="center" bgcolor="#eab308" style="border-radius: 4px;">
                          <a href="${whatsappLink}" target="_blank" style="display: inline-block; padding: 12px 20px; font-size: 14px; color: #ffffff; font-weight: bold; text-decoration: none;">
                            <img src="https://i.ibb.co/DGH7PLM/whatsapp-icon.png" alt="WhatsApp" width="18" height="18" style="display: inline; vertical-align: middle; margin-right: 8px;">Join Team WhatsApp
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Important Information -->
                <tr>
                  <td style="padding: 0 0 20px;">
                    <h3 style="margin: 0 0 15px; color: #111827; font-size: 16px; font-weight: bold;">Important Information</h3>
                    
                    <!-- Date & Venue -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0" style="margin-bottom: 15px;">
                      <tr>
                        <td width="24" valign="top">
                          <img src="https://i.ibb.co/FXwg99q/calendar-icon.png" alt="Date" width="20" height="20" style="display: block;">
                        </td>
                        <td style="padding-left: 10px;">
                          <p style="margin: 0; color: #111827; font-weight: bold; font-size: 14px;">July 4-10, 2025</p>
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">GOFAMINT Akure</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Theme -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0" style="margin-bottom: 15px;">
                      <tr>
                        <td width="24" valign="top">
                          <img src="https://i.ibb.co/bzzkC7N/theme-icon.png" alt="Theme" width="20" height="20" style="display: block;">
                        </td>
                        <td style="padding-left: 10px;">
                          <p style="margin: 0; color: #111827; font-weight: bold; font-size: 14px;">2025 Covenant Exchange</p>
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Conference Theme</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Team Assignment -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                      <tr>
                        <td width="24" valign="top">
                          <img src="https://i.ibb.co/M9BF3JV/team-icon.png" alt="Team" width="20" height="20" style="display: block;">
                        </td>
                        <td style="padding-left: 10px;">
                          <p style="margin: 0; color: #e53e3e; font-weight: bold; font-size: 14px;">Team ${userData.teamName}</p>
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Your assigned team for activities</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Final Message -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="margin: 0 0 10px; color: #4b5563; font-size: 14px; line-height: 1.5;">If you have any questions, feel free to reply to this email or contact the EGC planning committee.</p>
                    <p style="margin: 0; color: #111827; font-size: 15px; font-weight: bold;">We look forward to seeing you at EGC 2025! 🎉</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Yellow Separator -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tr>
                  <td style="padding: 0 30px;">
                    <div style="height: 1px; background-color: #eab308; margin: 30px 0;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">THE GOSPEL FAITH MISSION INTERNATIONAL</p>
              <p style="margin: 5px 0 0; color: #9ca3af; font-size: 12px;">&copy; ${year} EGC Conference. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const passwordResetEmailTemplate = (resetLink: string, year: number) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f7fa;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0" style="background-color: #f5f7fa;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!-- Main Email Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" border="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.1);">
          <!-- Header with Logo -->
          <tr>
            <td align="center" bgcolor="#111827" style="padding: 25px 0;">
              <img src="${emailConfig.logoUrl}" alt="GOFAMINT Logo" width="80" style="display: block; margin: 0 auto;">
            </td>
          </tr>
          
          <!-- Banner -->
          <tr>
            <td align="center" bgcolor="#e53e3e" style="padding: 20px; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold;">EGC CONFERENCE 2025</h1>
              <p style="margin: 5px 0 0; font-size: 14px;">Password Reset Request</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <h2 style="margin: 0 0 20px; color: #111827; font-size: 18px;">Reset Your Password</h2>
                    <p style="margin: 0 0 15px; color: #4b5563; font-size: 14px; line-height: 1.5;">We received a request to reset your password for your EGC Conference 2025 account.</p>
                    <p style="margin: 0 0 25px; color: #4b5563; font-size: 14px; line-height: 1.5;">If you didn't make this request, you can safely ignore this email. Otherwise, click the button below to create a new password:</p>
                  </td>
                </tr>
                
                <!-- Button -->
                <tr>
                  <td align="center" style="padding: 10px 0 25px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" bgcolor="#e53e3e" style="border-radius: 4px;">
                          <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 12px 25px; font-size: 14px; color: #ffffff; font-weight: bold; text-decoration: none;">Reset Password</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
               
                
                
                <!-- Security Note -->
                <tr>
                  <td style="padding: 15px; background-color: #f7f7f7; border-left: 4px solid #eab308;">
                    <p style="margin: 0 0 5px; color: #111827; font-size: 14px; font-weight: bold;">⚠️ This link expires in 1 hour</p>
                    <p style="margin: 0; color: #4b5563; font-size: 13px;">For security reasons, the password reset link will only be valid for 1 hour from the time this email was sent.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Yellow Separator -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tr>
                  <td style="padding: 0 30px;">
                    <div style="height: 1px; background-color: #eab308; margin: 30px 0;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">THE GOSPEL FAITH MISSION INTERNATIONAL</p>
              <p style="margin: 5px 0 0; color: #9ca3af; font-size: 12px;">&copy; ${year} EGC Conference. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Note: Team utility functions are now imported from '../utils/teamUtils'
