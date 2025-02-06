import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { AppInit } from '@/components/ui/app-init';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Featok - Product Idea Voting Platform',
    template: '%s | Featok'
  },
  description: 'A modern platform for collecting and voting on product ideas with a Tinder-like interface. Share your ideas and get instant feedback!',
  keywords: ['product ideas', 'voting platform', 'feedback', 'startup ideas', 'product validation'],
  authors: [{ name: 'Featok Team' }],
  creator: 'Featok Team',
  publisher: 'Featok',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://featok.vercel.app',
    siteName: 'Featok',
    title: 'Featok - Product Idea Voting Platform',
    description: 'A modern platform for collecting and voting on product ideas with a Tinder-like interface. Share your ideas and get instant feedback!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Featok - Product Idea Voting Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Featok - Product Idea Voting Platform',
    description: 'A modern platform for collecting and voting on product ideas with a Tinder-like interface. Share your ideas and get instant feedback!',
    images: ['/og-image.png'],
    creator: '@featok',
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      }
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#3B82F6',
      },
    ],
  },
  manifest: '/site.webmanifest',
  applicationName: 'Featok',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Featok',
  },
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
      </head>
      <body className={GeistSans.className}>
        <AppInit />
        {children}
      </body>
    </html>
  );
}
