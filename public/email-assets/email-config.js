// Email configuration for templates
// This file centralizes all email-related settings

const emailConfig = {
  // Base URL for the app - used for links in emails
  appBaseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Assets - must use absolute URLs for email clients
  logoUrl: 'https://res.cloudinary.com/joycrown/image/upload/v1747749167/GofamintLogo_lbe0yk.png', // Reliable hosted image URL for email clients
  
  // Conference details
  conferenceName: 'EGC Conference 2026',
  conferenceFullName: 'Emerging Generals\' Conference 2026',
  conferenceDate: 'July 10-12, 2026',
  
  // Organization details
  orgName: 'The Gospel Faith Mission International',
  
  // Color schemes
  colors: {
    primary: '#e53e3e', // red-600
    secondary: '#9f1239', // red-900
    dark: '#111827',  // gray-900
    light: '#f9fafb', // gray-50
    teams: {
      Bethel: '#eab308', // amber-500
      Judah: '#e53e3e',  // red-600
      Salem: '#3b82f6',  // blue-600
      Shiloh: '#8b5cf6'  // purple-600
    }
  }
};

module.exports = emailConfig;
