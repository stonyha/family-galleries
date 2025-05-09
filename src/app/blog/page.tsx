import { Metadata } from 'next';
import BlogList from '@/components/blog/BlogList';
import { getBlogPosts } from '@/lib/api/blog';
import Layout from '@/components/layout/Layout';

export const metadata: Metadata = {
  title: 'Blog | Family Galleries',
  description: 'Read our latest stories and insights about family moments and memories.',
};

interface BlogPageProps {
  searchParams: { page?: string };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const currentPage = Number(searchParams.page) || 1;
  const { posts, totalPages } = await getBlogPosts(currentPage);

  return (
    <Layout
      title="Blog"
      description="Read our latest stories and insights about family moments and memories"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog của chúng tôi</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tìm hiểu về các câu chuyện, mẹo và bài viết về việc lưu giữ kỷ niệm gia đình của bạn
          </p>
        </div>
        <BlogList posts={posts} currentPage={currentPage} totalPages={totalPages} />
      </div>
    </Layout>
  );
} 