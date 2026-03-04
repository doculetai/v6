import type { Metadata } from 'next';

import { ThemeProvider } from '@/components/theme-provider';
import { defaultTheme } from '@/config/theme';
import { plexSans, plexSerif } from '@/lib/fonts';

import './globals.css';

export const metadata: Metadata = {
  title: 'Doculet.ai — Proof of Funds Verification',
  description:
    'Connecting students, sponsors, and universities with verified proof-of-funds documentation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plexSans.variable} ${plexSerif.variable} antialiased`}>
        <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
