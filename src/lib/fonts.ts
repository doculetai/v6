import { IBM_Plex_Sans, IBM_Plex_Serif } from 'next/font/google';

export const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
});

export const plexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-serif',
  display: 'swap',
});
