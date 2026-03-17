import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const SITE_URL = 'https://www.dylanvdven.xyz';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Dylan Van Der Ven | Portfolio',
    template: '%s | Dylan Van Der Ven',
  },
  description: 'Full-stack developer and UI/UX designer portfolio showcasing projects, skills, and experience.',
  applicationName: 'Dylan Van Der Ven Portfolio',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'Dylan Van Der Ven',
    'Full-stack developer',
    'UI UX designer',
    'Next.js portfolio',
    'TypeScript developer',
    'Web developer Netherlands',
  ],
  authors: [{ name: 'Dylan Van Der Ven', url: SITE_URL }],
  creator: 'Dylan Van Der Ven',
  publisher: 'Dylan Van Der Ven',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: 'Dylan Van Der Ven | Portfolio',
    description: 'Full-stack developer and UI/UX designer portfolio showcasing projects, skills, and experience.',
    siteName: 'Dylan Van Der Ven Portfolio',
    images: [
      {
        url: '/images/Portfolio2.png',
        width: 1200,
        height: 630,
        alt: 'Dylan Van Der Ven Portfolio Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dylan Van Der Ven | Portfolio',
    description: 'Full-stack developer and UI/UX designer portfolio showcasing projects, skills, and experience.',
    images: ['/images/Portfolio2.png'],
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e1e1e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}