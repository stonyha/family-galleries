import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    template: '%s | Sipikidi\'s Galleries',
    default: 'Sipikidi\'s Galleries | Lưu giữ kỷ niệm',
  },
  description: 'Một bộ sưu tập các bức ảnh gia đình từ các sự kiện và lễ hội.',
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
