'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface DynamicSeoProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export default function DynamicSeo({
  title = 'EGC Conference 2025 | The Gospel Faith Mission International',
  description = 'Join EGC Conference 2025, the annual gathering of The Gospel Faith Mission International youth. Register now for spiritual enrichment, fellowship, and transformation.',
  image = '/images/og-image.jpg',
  type = 'website',
}: DynamicSeoProps) {
  const pathname = usePathname();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://egc-conference.com';
  const canonicalUrl = `${siteUrl}${pathname}`;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Head>
      {/* Standard meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
    </Head>
  );
}
