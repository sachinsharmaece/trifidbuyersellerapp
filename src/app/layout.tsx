import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, Noto_Sans_Devanagari } from 'next/font/google';
import { Providers } from '../providers/Providers';
import './globals.css';

// The prototypes' type (trifid data/buyer.html, supplier.html): IBM Plex for Latin, with
// Noto Sans Devanagari so हिंदी renders in one designed face rather than the phone's fallback.
const plexSans = IBM_Plex_Sans({
  variable: '--font-plex-sans',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: '--font-noto-devanagari',
  subsets: ['devanagari'],
});

export const viewport: Viewport = {
  themeColor: '#0b5d3b',
};

export const metadata: Metadata = {
  title: 'TriFid',
  description: 'TriFid — buyer and seller app',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${notoDevanagari.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
