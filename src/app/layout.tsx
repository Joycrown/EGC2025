import '../styles/globals.css';
import { Inter, Outfit } from 'next/font/google';
import type { Metadata } from 'next';

// Load fonts
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'EGC Conference 2025 | The Gospel Faith Mission International',
  description: 'Join EGC Conference 2025, the annual gathering of The Gospel Faith Mission International youth. Register now for spiritual enrichment, fellowship, and transformation.',
  keywords: 'EGC Conference, GOFAMINT, The Gospel Faith Mission International, Christian Conference, Youth Conference, Faith Conference, Religious Event',
  authors: [{ name: 'The Gospel Faith Mission International' }],
  category: 'Religion',
  openGraph: {
    title: 'EGC Conference 2025 | The Gospel Faith Mission International',
    description: 'Join EGC Conference 2025, the annual gathering of The Gospel Faith Mission International youth. Register now for spiritual enrichment, fellowship, and transformation.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'EGC Conference',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'EGC Conference 2025',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EGC Conference 2025 | The Gospel Faith Mission International',
    description: 'Join EGC Conference 2025, the annual gathering of The Gospel Faith Mission International youth. Register now for spiritual enrichment, fellowship, and transformation.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/twitter-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans">
        {children}
      </body>
    </html>
  );
}
