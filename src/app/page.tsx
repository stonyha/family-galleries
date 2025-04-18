import HeroSection from '@/components/home/HeroSection';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import FeatureCarousel from '@/components/carousel/FeatureCarousel';
import Layout from '@/components/layout/Layout';
import QuickUploadButton from '@/components/home/QuickUploadButton';
import { getHomePage, getFeaturedGalleries, getFeatureCarouselItems } from '@/lib/contentful';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sipikidi\'s Galleries | Lưu giữ kỷ niệm',
  description: 'Một bộ sưu tập các bức ảnh gia đình từ các sự kiện và lễ hội.',
};

export const revalidate = 3600; // Revalidate the data at most every hour

export default async function HomePage() {
  const homePage = await getHomePage();
  const featuredGalleries = await getFeaturedGalleries(3);
  const featureCarouselItems = await getFeatureCarouselItems(5);
  
  // Use type assertions to handle Contentful data
  const title = homePage && typeof homePage === 'object' && 'fields' in homePage 
    ? (homePage.fields as any).title || 'Family Galleries'
    : 'Family Galleries';
    
  const intro = homePage && typeof homePage === 'object' && 'fields' in homePage
    ? (homePage.fields as any).intro || 'Capture, share, and relive your family memories.'
    : 'Capture, share, and relive your family memories.';
    
  let heroImage: string | undefined = undefined;
  
  if (homePage && 
      typeof homePage === 'object' && 
      'fields' in homePage && 
      (homePage.fields as any).heroImage &&
      typeof (homePage.fields as any).heroImage === 'object' &&
      'fields' in (homePage.fields as any).heroImage &&
      (homePage.fields as any).heroImage.fields.file?.url) {
    heroImage = `https:${(homePage.fields as any).heroImage.fields.file.url}`;
  }
  
  return (
    <Layout>
      {featureCarouselItems.length > 0 && (
        <FeatureCarousel
          items={featureCarouselItems}
          autoAdvance={true}
          interval={8000}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GalleryGrid
          galleries={featuredGalleries}
          title="Bộ sưu tập nổi bật"
          emptyMessage="Chưa có bộ sưu tập nào được tạo. Hãy quay lại sau!"
        />
      </div>
      <HeroSection
        title={title}
        intro={intro}
        imageUrl={heroImage}
      />
      
      {/* Quick Upload Button */}
      <QuickUploadButton />          
    </Layout>
  );
}
