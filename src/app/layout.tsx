import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import { Providers } from '@/components/providers';

import './globals.css';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'FolioMint — Turn Your Resume Into a Portfolio',
    template: '%s | FolioMint',
  },
  description:
    'Convert your resume into a beautiful, editable portfolio website. AI-powered parsing, multiple themes, and custom domains.',
  keywords: [
    'portfolio',
    'resume',
    'CV',
    'website builder',
    'developer portfolio',
    'professional portfolio',
  ],
  authors: [{ name: 'FolioMint' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'FolioMint',
    title: 'FolioMint — Turn Your Resume Into a Portfolio',
    description:
      'Convert your resume into a beautiful, editable portfolio website in minutes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FolioMint — Turn Your Resume Into a Portfolio',
    description:
      'Convert your resume into a beautiful, editable portfolio website in minutes.',
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/logo.png'],
    apple: ['/logo.png'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#131a1e' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
