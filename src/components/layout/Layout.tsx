import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

type LayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export default function Layout({ 
  children, 
  title = 'Sipikidi\'s Family', 
  description = 'A collection of family photo galleries and memories' 
}: LayoutProps) {
  const fullTitle = title === 'Sipikidi\'s Family' 
    ? title 
    : `${title} | Sipikidi's Family`;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
} 