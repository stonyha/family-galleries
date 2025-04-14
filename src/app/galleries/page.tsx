import { Metadata } from 'next';
import Layout from '@/components/layout/Layout';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import { getGalleries } from '@/lib/contentful';

export const metadata: Metadata = {
  title: 'Photo Galleries | Family Galleries',
  description: 'Browse our collection of family photo galleries from various events and occasions.',
};

export const revalidate = 3600; // Revalidate the data at most every hour

export default async function GalleriesPage() {
  const galleries = await getGalleries();
  
  return (
    <Layout
      title="Photo Galleries"
      description="Browse through our collection of family photo galleries"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Photo Galleries</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Browse through our collection of family photos, organized by event and occasion. 
            Click on a gallery to view all the photos from that event.
          </p>
        </div>
        
        <GalleryGrid
          galleries={galleries}
          emptyMessage="No galleries have been created yet. Check back soon!"
        />
      </div>
    </Layout>
  );
} 