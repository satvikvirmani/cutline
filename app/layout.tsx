import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Barlow_Condensed, IBM_Plex_Mono, Inter } from 'next/font/google';
import './globals.css';

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-data',
});

export const metadata: Metadata = {
  title: '30-Day Cut Tracker',
  description: 'Daily fat-loss, macro and workout tracker',
  manifest: '/manifest.json',
  themeColor: '#1C2B27',
  appleWebApp: {
    capable: true,
    title: '30-Day Cut',
    statusBarStyle: 'default',
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${barlow.variable} ${inter.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
