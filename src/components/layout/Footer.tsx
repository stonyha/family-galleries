import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-amber-600">Sipikidi's Family</h3>
            <p className="text-sm text-gray-500">Lưu giữ kỷ niệm, một bức ảnh một lần.</p>
          </div>
          
          <nav className="flex flex-wrap justify-center space-x-6">
            <Link 
              href="/galleries"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Bộ sưu tập
            </Link>
            <Link 
              href="/videos"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Video
            </Link>
            <Link 
              href="/blog"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Blog
            </Link>
            <Link 
              href="/about"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Về chúng tôi
            </Link>
          </nav>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© {currentYear} Sipikidi's Family. Toàn bộ bản quyền thuộc Sipikidi's family.</p>
        </div>
      </div>
    </footer>
  );
} 