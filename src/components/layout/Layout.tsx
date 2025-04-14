import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';

type LayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export default function Layout({ 
  children, 
  title = 'Sipikidi\'s Galleries', 
  description = 'A collection of family photo galleries and memories' 
}: LayoutProps) {
  const fullTitle = title === 'Sipikidi\'s Galleries' 
    ? title 
    : `${title} | Sipikidi's Galleries`;
  
  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
} 