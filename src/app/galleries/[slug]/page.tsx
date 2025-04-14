import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import PhotoGrid from '@/components/gallery/PhotoGrid';
import { getGalleryBySlug, getGalleries } from '@/lib/contentful';
import { formatEventDate } from '@/utils/dateUtils';

type GalleryPageProps = {
  params: {
    slug: string;
  };
};

export const revalidate = 3600; // Revalidate the data at most every hour

// Generate static pages at build time for all galleries
export async function generateStaticParams() {
  const galleries = await getGalleries();
  
  return galleries.map((gallery: any) => ({
    slug: gallery.fields.slug,
  }));
}

// Generate metadata for the page
export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  const { slug } = params;
  const gallery = await getGalleryBySlug(slug);
  
  if (!gallery) {
    return {
      title: 'Gallery Not Found | Family Galleries',
    };
  }
  
  const galleryFields = gallery.fields as any;
  
  return {
    title: `${galleryFields.title} | Family Galleries`,
    description: galleryFields.description || `Photos from ${galleryFields.title}`,
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { slug } = params;
  const gallery = await getGalleryBySlug(slug);
  
  if (!gallery) {
    notFound();
  }
  
  // Use type assertion to handle Contentful data
  const galleryFields = gallery.fields as any;
  const { 
    title, 
    description, 
    eventDate, 
    location, 
    images = [], 
    coverImage 
  } = galleryFields;
  
  const formattedDate = formatEventDate(eventDate);
  
  // Cover image for the hero section
  const coverImageUrl = coverImage?.fields?.file?.url 
    ? `https:${coverImage.fields.file.url}` 
    : '';
  
  return (
    <Layout
      title={title}
      description={description || `Photos from ${title}`}
    >
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white">
        {coverImageUrl && (
          <div className="absolute inset-0 opacity-40">
            <Image 
              src={coverImageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <Link 
              href="/galleries" 
              className="inline-flex items-center text-amber-300 hover:text-amber-400 mb-6"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Back to galleries
            </Link>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              {title}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-gray-300 mb-4">
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                {formattedDate}
              </div>
              
              {location && (
                <div className="flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                  {location}
                </div>
              )}
              
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                {images.length} Photos
              </div>
            </div>
            
            {description && (
              <p className="text-lg text-gray-300 mt-4">{description}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Photo Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PhotoGrid images={images} />
      </div>
    </Layout>
  );
} 