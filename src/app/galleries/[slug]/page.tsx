import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import PhotoGrid from '@/components/gallery/PhotoGrid';
import ShareButton from '@/components/gallery/ShareButton';
import ScrollToTop from '@/components/common/ScrollToTop';
import TokenGalleryWrapper from '@/components/gallery/TokenGalleryWrapper';
import { getGalleryBySlug, getGalleries } from '@/lib/contentful';
import { formatEventDate } from '@/utils/dateUtils';

// Import validateShareToken function
// The import from '@/utils/tokenUtils' might cause issues in some environments
// so we use dynamic import or fetch API in those cases
const validateShareToken = async (token: string): Promise<any> => {
  try {
    // Use absolute URL with origin for server component fetches
    const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000';
    const url = new URL(`/api/galleries/validate-token`, baseUrl);
    url.searchParams.set('token', token);
    
    console.log('Validating token using URL:', url.toString());
    
    // Try to validate the token by calling the API endpoint
    const response = await fetch(url.toString(), {
      cache: 'no-store',
      next: { revalidate: 0 } // Ensure fresh response
    });
    
    if (!response.ok) {
      console.error('Token validation API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log('Token validation response:', data);
    return data.valid ? data : null;
  } catch (error) {
    console.error('Error validating token:', error);
    return null;
  }
};

// Define params type as per Next.js convention
type PageParams = {
  slug: string;
}

// Define search params type as per Next.js convention
type PageSearchParams = {
  [key: string]: string | string[] | undefined;
}

export const revalidate = 3600; // Revalidate the data at most every hour

// Generate static pages at build time for all galleries
export async function generateStaticParams() {
  const galleries = await getGalleries();
  
  return galleries.map((gallery: any) => ({
    slug: gallery.fields.slug,
  }));
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: { params: PageParams },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await params before accessing properties
  const paramsObj = await Promise.resolve(params);
  const { slug } = paramsObj;
  
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

// Define the page component
export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: PageSearchParams;
}) {
  // Await the params and searchParams objects before accessing their properties
  const paramsObj = await Promise.resolve(params);
  const searchParamsObj = await Promise.resolve(searchParams);
  
  const { slug } = paramsObj;
  const token = searchParamsObj.token as string | undefined;
  
  // Check if access is via share token
  let isSharedAccess = false;
  if (token) {
    // Validate the token
    const tokenData = await validateShareToken(token);
    if (tokenData && tokenData.slug === slug) {
      isSharedAccess = true;
    } else if (tokenData === null) {
      // If token is invalid or expired, let middleware handle authentication
      // This will redirect to login if not authenticated
    }
  }
  
  // If this is not a shared access and the middleware didn't redirect,
  // proceed with normal authenticated access
  
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
    cloudImages = [], 
    coverImage 
  } = galleryFields;
  
  const formattedDate = formatEventDate(eventDate);
  
  // Order cloudImages from last to first (newest to oldest)
  const orderedCloudImages = [...cloudImages].reverse();
  
  // Cover image for the hero section
  const coverImageUrl = coverImage?.fields?.file?.url 
    ? `https:${coverImage.fields.file.url}` 
    : '';
  
  // Content to render
  const galleryContent = (
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
            <div className="flex flex-wrap justify-between items-start mb-6">
              <Link 
                href="/galleries" 
                className="inline-flex items-center text-amber-300 hover:text-amber-400"
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
            </div>
            
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
                {cloudImages.length} Photos
              </div>
              
              {isSharedAccess && (
                <div className="flex items-center bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 mr-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
                    />
                  </svg>
                  Shared View
                </div>
              )}
            </div>
            
            {description && (
              <p className="text-lg text-gray-300 mt-4">{description}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Photo Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PhotoGrid images={orderedCloudImages} />
      </div>
      
      {/* Floating buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        {/* Share button - only for authenticated users and not for shared access */}
        {!isSharedAccess && (
          <div className="share-button-wrapper">
            <ShareButton galleryId={gallery.sys.id} slug={slug} />
          </div>
        )}
        
        {/* Scroll to top button */}
        <ScrollToTop />
      </div>
    </Layout>
  );
  
  // If this is a shared access via token, wrap with TokenGalleryWrapper component
  if (token) {
    return (
      <TokenGalleryWrapper token={token}>
        {galleryContent}
      </TokenGalleryWrapper>
    );
  }
  
  // Otherwise, just render the content
  return galleryContent;
} 