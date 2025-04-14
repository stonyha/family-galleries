import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    template: '%s | Family Galleries',
    default: 'Family Galleries | Preserving Memories',
  },
  description: 'A beautiful collection of family photo galleries from various events and occasions.',
  keywords: ['family', 'photos', 'gallery', 'memories', 'events', 'photography'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
