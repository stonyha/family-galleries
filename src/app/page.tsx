import HeroSection from '@/components/home/HeroSection';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import Layout from '@/components/layout/Layout';
import { getHomePage, getFeaturedGalleries } from '@/lib/contentful';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Family Galleries | Preserving Memories',
  description: 'A collection of family photo galleries from various events and occasions.',
};

export const revalidate = 3600; // Revalidate the data at most every hour

export default async function HomePage() {
  const homePage = await getHomePage();
  const featuredGalleries = await getFeaturedGalleries(3);
  
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
      <HeroSection
        title={title}
        intro={intro}
        imageUrl={heroImage}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GalleryGrid
          galleries={featuredGalleries}
          title="Featured Galleries"
          emptyMessage="No galleries have been created yet. Check back soon!"
        />
      </div>
    </Layout>
  );
}
