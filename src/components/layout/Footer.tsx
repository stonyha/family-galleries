import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-amber-600">Family Galleries</h3>
            <p className="text-sm text-gray-500">Preserving memories, one photo at a time.</p>
          </div>
          
          <nav className="flex flex-wrap justify-center space-x-6">
            <Link 
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Home
            </Link>
            <Link 
              href="/galleries"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Galleries
            </Link>
            <Link 
              href="/about"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              About
            </Link>
          </nav>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© {currentYear} Family Galleries. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 