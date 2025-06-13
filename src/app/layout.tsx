import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Inter, Outfit } from 'next/font/google';
import type { Metadata } from 'next';

// Load fonts
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-outfit',
  preload: true,
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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16' },
      { url: '/favicon-32x32.png', sizes: '32x32' },
      { url: '/icon-192x192.png', sizes: '192x192' },
      { url: '/icon-512x512.png', sizes: '512x512' },
    ],
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
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
