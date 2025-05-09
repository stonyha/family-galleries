import BlogCard from './BlogCard';
import { BlogPost } from '@/lib/api/blog';

interface BlogListProps {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
}

export default function BlogList({ posts, currentPage, totalPages }: BlogListProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} {...post} />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <a
                key={page}
                href={`/blog?page=${page}`}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-md border ${
                  currentPage === page
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
} 