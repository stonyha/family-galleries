import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface BlogCardProps {
  title: string;
  excerpt: string;
  slug: string;
  featuredImage: {
    url: string;
    alt: string;
  };
  publishDate: string;
  author: string;
}

export default function BlogCard({
  title,
  excerpt,
  slug,
  featuredImage,
  publishDate,
  author,
}: BlogCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={featuredImage.url}
          alt={featuredImage.alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex-1">
          <p className="text-sm text-gray-500">
            {formatDate(publishDate)} • {author}
          </p>
          <Link href={`/blog/${slug}`} className="mt-2 block">
            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
              {title}
            </h3>
          </Link>
          <p className="mt-3 text-base text-gray-500 line-clamp-3">{excerpt}</p>
        </div>
        <div className="mt-6">
          <Link
            href={`/blog/${slug}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Đọc thêm <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
} 