import Image from 'next/image';
import Link from 'next/link';
import { formatEventDate } from '@/utils/dateUtils';

type GalleryCardProps = {
  gallery: any; // We'll cast this to our Contentful types when used
};

export default function GalleryCard({ gallery }: GalleryCardProps) {
  const { title, slug, description, eventDate, thumbnail, coverImage, location } = gallery.fields;
  
  // Remove debug logging in production
  // console.log('Thumbnail structure:', JSON.stringify(thumbnail, null, 2));
  
  let imageUrl = '';
  let imageAlt = title;
  let imageWidth = 800;
  let imageHeight = 600;
  
  // Handle the Cloudinary thumbnail data (which is an array)
  if (thumbnail && Array.isArray(thumbnail) && thumbnail.length > 0) {
    const cloudinaryImage = thumbnail[0];
    // Use secure_url for HTTPS
    imageUrl = cloudinaryImage.secure_url;
    imageWidth = cloudinaryImage.width;
    imageHeight = cloudinaryImage.height;
    // No need to add https: prefix since secure_url already includes it
  } else if (coverImage?.fields) {
    // Fall back to Contentful coverImage if thumbnail not available
    imageUrl = `https:${coverImage.fields.file?.url || ''}`;
    imageAlt = coverImage.fields.title || title;
    imageWidth = coverImage.fields.file?.details?.image?.width || 800;
    imageHeight = coverImage.fields.file?.details?.image?.height || 600;
  }
  
  const aspectRatio = imageHeight / imageWidth;
  const displayHeight = Math.round(320 * aspectRatio);
  
  return (
    <Link href={`/galleries/${slug}`} className="block">
      <div className="gallery-item rounded-lg overflow-hidden">
        <div className="relative aspect-[4/3] bg-gray-200">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={640}
              height={displayHeight}
              className="w-full h-full object-cover"
              priority={false}
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={85}
            />
          )}
          
          <div className="gallery-item-caption">
            <h3 className="text-xl font-bold photo-title mb-1">{title}</h3>
            
            <div className="flex items-center justify-center text-sm text-gray-200 mb-2">
              <span className="mr-3">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 inline mr-1" 
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
                {formatEventDate(eventDate)}
              </span>
              
              {location && (
                <span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 inline mr-1" 
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
                </span>
              )}
            </div>
            
            {description && (
              <p className="text-gray-100 line-clamp-2 text-sm">{description}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
} 