import { Metadata } from 'next';
import Layout from '@/components/layout/Layout';
import { getVideoListingPage, getFeaturedVideos } from '@/lib/contentful';
import VideoGrid from '@/components/video/VideoGrid';

export const metadata: Metadata = {
  title: 'Videos | Sipikidi\'s Galleries',
  description: 'Watch our collection of family videos and memories.',
};

export default async function VideoListingPage() {
  const videoListingPage = await getVideoListingPage();
  const videos = await getFeaturedVideos(12); // Get more videos for the listing page

  // Extract page content from Contentful response
  const heading = videoListingPage?.fields?.heading || 'Our Videos';
  const description = videoListingPage?.fields?.description || 'Watch our collection of family videos and memories.';

  return (
    <Layout
    title="Videos"
      description="Xem qua bộ sưu tập các video gia đình của chúng tôi.">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{heading}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {description}
          </p>
        </div>
        {/* Video Grid */}
        <VideoGrid videos={videos} />
      </div>
    </Layout>
  );
} 