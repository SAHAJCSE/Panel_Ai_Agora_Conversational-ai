import type { Metadata, Viewport } from 'next';
import './globals.css';

const metadataOrigin = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(metadataOrigin),
  title: 'Panel AI | Adaptive Interview Intelligence',
  description:
    'Others adapt the question. Panel AI adapts the interviewer. Run AI-powered voice interviews with dynamic interviewer switching.',
  openGraph: {
    title: 'Panel AI | Adaptive Interview Intelligence',
    description: 'Others adapt the question. Panel AI adapts the interviewer.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Panel AI interview platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Panel AI | Adaptive Interview Intelligence',
    description: 'Others adapt the question. Panel AI adapts the interviewer.',
    images: ['/og.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
    other: [
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <body className="h-full min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
