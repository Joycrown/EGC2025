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
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 0 auto; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background-color: #111827; padding: 20px 0; text-align: center;">
                    <img src="${emailConfig.logoUrl}" alt="GOFAMINT Logo" style="max-width: 100px; height: auto;">
                  </td>
                </tr>
                <tr>
                  <td style="background: linear-gradient(135deg, #e53e3e 0%, #9f1239 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; padding: 0; font-size: 24px; font-weight: 700;">EGC CONFERENCE 2025</h1>
                    <p style="color: white; margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Emerging Generals' Conference</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <h2 style="color: #111827; margin: 0 0 20px; font-size: 20px; font-weight: 600;">Email Verification</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px;">Thank you for registering for the Emerging Generals' Conference 2025!</p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">To complete your registration, please verify your email address by clicking the button below:</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 15px 0 25px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #e53e3e; border-radius: 6px; box-shadow: 0 4px 6px rgba(229, 62, 62, 0.25);">
                          <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 14px 30px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">Verify Email Address</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 25px;">
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 5px;">If the button above doesn't work, copy and paste the following link into your browser:</p>
                    <p style="color: #3b82f6; font-size: 14px; line-height: 1.6; margin: 0; word-break: break-all;">
                      <a href="${verificationLink}" style="color: #3b82f6; text-decoration: none;">${verificationLink}</a>
                    </p>
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
            <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">THE GOSPEL FAITH MISSION INTERNATIONAL</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; ${year} EGC Conference. All rights reserved.</p>
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
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 0 auto; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background-color: #111827; padding: 20px 0; text-align: center;">
                    <img src="${emailConfig.logoUrl}" alt="GOFAMINT Logo" style="max-width: 100px; height: auto;">
                  </td>
                </tr>
                <tr>
                  <td style="${getTeamGradient(userData.teamName)} padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; padding: 0; font-size: 24px; font-weight: 700;">EGC CONFERENCE 2025</h1>
                    <p style="color: white; margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Welcome to Team ${userData.teamName}!</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <h2 style="color: #111827; margin: 0 0 20px; font-size: 20px; font-weight: 600;">Welcome, ${userData.fullName}!</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px;">Thank you for verifying your email. Your registration for the Emerging Generals' Conference 2025 is now complete!</p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">Here are your registration details:</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 25px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                      <tr>
                        <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0;">Participant ID</p>
                        </td>
                        <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb;">
                          <p style="color: #111827; font-weight: 500; font-size: 14px; margin: 0;">${userData.userId}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0;">Role</p>
                        </td>
                        <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb;">
                          <p style="color: #111827; font-weight: 500; font-size: 14px; margin: 0;">${userData.role}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0;">Team</p>
                        </td>
                        <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb;">
                          <p style="color: ${getTeamColor(userData.teamName)}; font-weight: 700; font-size: 14px; margin: 0;">Team ${userData.teamName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 20px; background-color: #f9fafb;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0;">Conference Dates</p>
                        </td>
                        <td style="padding: 12px 20px;">
                          <p style="color: #111827; font-weight: 500; font-size: 14px; margin: 0;">July 4-10, 2025</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 5px 0 25px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #25D366; border-radius: 6px; box-shadow: 0 4px 6px rgba(37, 211, 102, 0.25);">
                          <a href="${whatsappLink}" target="_blank" style="display: inline-block; padding: 14px 24px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
                            <img src="https://i.ibb.co/DGH7PLM/whatsapp-icon.png" alt="WhatsApp" style="height: 18px; width: 18px; vertical-align: middle; margin-right: 8px;">  Join Team ${userData.teamName} Group
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px; margin: 0 0 25px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="color: #111827; margin: 0 0 15px; font-size: 18px; font-weight: 600;">Next Steps</h3>
                          <ul style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 22px;">
                            <li style="margin-bottom: 10px;">Mark your calendar for <strong>July 4-10, 2025</strong></li>
                            <li style="margin-bottom: 10px;">Download the conference schedule (will be sent closer to the date)</li>
                            <li style="margin-bottom: 10px;">Connect with fellow attendees through your team WhatsApp group</li>
                            <li>Watch out for regular updates in your email</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">If you have any questions, feel free to reply to this email or contact the EGC planning committee.</p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">We look forward to seeing you at EGC 2025!</p>
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
            <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">THE GOSPEL FAITH MISSION INTERNATIONAL</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; ${year} EGC Conference. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Helper functions for email templates
function getTeamColor(teamName: string): string {
  const colorMap: {[key: string]: string} = {
    'Bethel': '#eab308',  // amber-500
    'Judah': '#e53e3e',   // red-600
    'Salem': '#3b82f6',   // blue-600
    'Shiloh': '#8b5cf6'   // purple-600
  };
  
  return colorMap[teamName] || '#e53e3e';
}

function getTeamGradient(teamName: string): string {
  const gradientMap: {[key: string]: string} = {
    'Bethel': 'background: linear-gradient(135deg, #eab308 0%, #d97706 100%)',
    'Judah': 'background: linear-gradient(135deg, #e53e3e 0%, #9f1239 100%)',
    'Salem': 'background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    'Shiloh': 'background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
  };
  
  return gradientMap[teamName] || 'background: linear-gradient(135deg, #e53e3e 0%, #9f1239 100%)';
}
