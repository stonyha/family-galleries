import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, BlogPost } from '@/lib/api/blog';
import { formatDate } from '@/lib/utils';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Layout from '@/components/layout/Layout';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | Family Galleries',
    };
  }

  return {
    title: `${post.title} | Family Galleries`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage.url ? [post.featuredImage.url] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <Layout
      title={post.title}
      description={post.excerpt}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="max-w-3xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-center space-x-4 text-gray-600">
              <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
              <span>•</span>
              <span>{post.author}</span>
            </div>
          </header>

          {post.featuredImage.url && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-12">
              <Image
                src={post.featuredImage.url}
                alt={post.featuredImage.alt}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {documentToReactComponents(post.content)}
          </div>
        </article>
      </div>
    </Layout>
  );
} 