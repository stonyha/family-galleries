import { createClient } from 'contentful';
import { FeatureItem } from '@/components/carousel/FeatureCarousel';
import { VideoItem, VideoListingPage } from '@/types/video';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || '',
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
});

// Cache duration in seconds
const CACHE_DURATION = 60 * 60; // 1 hour
const cache: Record<string, { data: any; timestamp: number }> = {};

function getCachedData(key: string) {
  const cachedItem = cache[key];
  if (!cachedItem) return null;
  
  const now = Date.now();
  if ((now - cachedItem.timestamp) / 1000 > CACHE_DURATION) {
    // Cache expired
    delete cache[key];
    return null;
  }
  
  return cachedItem.data;
}

function setCacheData(key: string, data: any) {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
  return data;
}

export const getGalleries = async () => {
  const cacheKey = 'galleries';
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await client.getEntries({
    content_type: 'gallery',
    order: ['-fields.eventDate'],
  });
  
  return setCacheData(cacheKey, response.items);
};

export const getGalleryBySlug = async (slug: string) => {
  const cacheKey = `gallery_${slug}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await client.getEntries({
    content_type: 'gallery',
    'fields.slug': slug,
    limit: 1,
  });
  
  return setCacheData(cacheKey, response.items[0]);
};

export const getHomePage = async () => {
  const cacheKey = 'homepage';
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await client.getEntries({
    content_type: 'homePage',
    limit: 1,
  });
  
  return setCacheData(cacheKey, response.items[0]);
};

export const getAboutPage = async () => {
  const cacheKey = 'aboutpage';
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const response = await client.getEntries({
    content_type: 'aboutPage',
    limit: 1,
  });
  
  return setCacheData(cacheKey, response.items[0]);
};

export const getFeaturedGalleries = async (limit = 3) => {
  const cacheKey = `featured_galleries_${limit}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  const homePage = await getHomePage();
  
  if (!homePage) return [];
  
  const featuredGalleryIds = homePage.fields.featuredGalleries?.map(
    (gallery: any) => gallery.sys.id
  ) || [];
  
  if (featuredGalleryIds.length === 0) {
    // If no featured galleries are set, return the most recent ones
    const response = await client.getEntries({
      content_type: 'gallery',
      order: ['-fields.eventDate'],
      limit,
    });
    
    return setCacheData(cacheKey, response.items);
  }
  
  const response = await client.getEntries({
    content_type: 'gallery',
    'sys.id[in]': featuredGalleryIds.join(','),
    limit: featuredGalleryIds.length,
  });
  
  return setCacheData(cacheKey, response.items);
};

export const getFeatureCarouselItems = async (limit = 3) => {
  const cacheKey = `feature_carousel_items_${limit}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const homePage = await getHomePage();
    
    if (!homePage) return [];
    
    let entries;
    
    if (homePage.fields && homePage.fields.featureCarouselItems) {
      const featureItemIds = homePage.fields.featureCarouselItems.map(
        (item: any) => item.sys.id
      );
      
      if (featureItemIds.length > 0) {
        entries = await client.getEntries({
          content_type: 'featureCarouselItem',
          'sys.id[in]': featureItemIds.join(','),
          limit: featureItemIds.length,
          include: 3 // Include linked entries (increased to 3 levels deep)
        });
      } else {
        entries = await client.getEntries({
          content_type: 'featureCarouselItem',
          order: ['fields.order'],
          limit,
          include: 3
        });
      }
    } else {
      entries = await client.getEntries({
        content_type: 'featureCarouselItem',
        order: ['fields.order'],
        limit,
        include: 3
      });
    }
    
    // Transform Contentful data to our FeatureItem format
    const featureItems: FeatureItem[] = entries.items.map((item: any) => {
      // Make sure sys.id is available and used
      const id = item.sys?.id || `item-${Math.random().toString(36).substr(2, 9)}`;
      
      const fields = item.fields || {};
      
      // Display debug info in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Processing feature item ${id}:`, {
          heading: fields.heading,
          hasCtaLink: !!fields.ctaLink,
          linkType: fields.ctaLink ? typeof fields.ctaLink : null,
          linkSys: fields.ctaLink && fields.ctaLink.sys ? fields.ctaLink.sys : null,
        });
      }
      
      // Process the link correctly - initial default
      let ctaLink: string = '#';
      
      // Handle link logic based on the field's structure
      try {
        if (typeof fields.ctaLink === 'string') {
          // Direct link (URL)
          ctaLink = fields.ctaLink;
        } else if (fields.ctaLink && fields.ctaLink.fields && fields.ctaLink.fields.slug) {
          // Fully resolved entry directly in the field
          const slug = fields.ctaLink.fields.slug;
          ctaLink = `/galleries/${slug}`;
        } else if (fields.ctaLink && fields.ctaLink.sys) {
          // Handle different reference structures
          if (fields.ctaLink.sys.type === 'Link' && fields.ctaLink.sys.linkType === 'Entry') {
            // This is a link to another entry
            const referencedEntryId = fields.ctaLink.sys.id;
            
            if (process.env.NODE_ENV === 'development') {
              console.log(`Looking for entry with ID ${referencedEntryId}`);
            }
            
            // Check if the referenced entry exists in the includes
            if (entries.includes && entries.includes.Entry) {
              const referencedEntry = entries.includes.Entry.find((entry: any) => 
                entry.sys.id === referencedEntryId
              );
              
              if (referencedEntry && referencedEntry.fields && referencedEntry.fields.slug) {
                const slug = referencedEntry.fields.slug;
                
                // Handle by content type if available
                if (referencedEntry.sys.contentType && 
                    referencedEntry.sys.contentType.sys && 
                    referencedEntry.sys.contentType.sys.id) {
                  
                  const contentType = referencedEntry.sys.contentType.sys.id;
                  
                  if (contentType === 'gallery') {
                    ctaLink = `/galleries/${slug}`;
                  } else if (contentType === 'page') {
                    ctaLink = `/${slug}`;
                  } else {
                    ctaLink = `/${contentType}/${slug}`;
                  }
                } else {
                  // Default if we can't determine content type
                  ctaLink = `/${slug}`;
                }
                
                if (process.env.NODE_ENV === 'development') {
                  console.log(`Resolved ctaLink to: ${ctaLink}`);
                }
              } else if (process.env.NODE_ENV === 'development') {
                console.log('Referenced entry not found in includes or missing slug', {
                  found: !!referencedEntry,
                  hasFields: referencedEntry ? !!referencedEntry.fields : false,
                  hasSlug: referencedEntry && referencedEntry.fields ? !!referencedEntry.fields.slug : false
                });
              }
            }
          }
        }
      } catch (e) {
        console.error('Error processing ctaLink for item', id, e);
      }
      
      // If ctaLink doesn't start with http or /, add the /
      if (ctaLink !== '#' && 
          typeof ctaLink === 'string' && 
          !ctaLink.startsWith('http') && 
          !ctaLink.startsWith('/')) {
        ctaLink = `/${ctaLink}`;
      }
      
      const imageUrl = fields.image?.fields?.file?.url 
        ? `https:${fields.image.fields.file.url}` 
        : '';
      
      const imageAlt = fields.image?.fields?.title || fields.heading || '';
      
      return {
        id,
        heading: fields.heading || 'Featured Item',
        summary: fields.summary || 'No description available',
        ctaLabel: fields.ctaLabel || 'Learn More',
        ctaLink,
        image: imageUrl,
        imageMobile: fields.imageMobile || null,
        altText: imageAlt,
      };
    });
    
    return setCacheData(cacheKey, featureItems);
  } catch (error) {
    console.error('Error fetching feature carousel items:', error);
    return [];
  }
};

export const getFeaturedVideos = async (limit = 6) => {
  const cacheKey = `featured_videos_${limit}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await client.getEntries({
      content_type: 'video',
      'fields.isFeatured': true,
      order: ['fields.order'],
      limit,
    });

    // Transform Contentful data to our VideoItem format
    const videos: VideoItem[] = response.items.map((item: any) => {
      const id = item.sys?.id || `video-${Math.random().toString(36).substr(2, 9)}`;
      const fields = item.fields || {};
      
      return {
        id,
        title: fields.title || '',
        description: fields.description || '',
        vimeoVideo: fields.vimeoVideo || '',
        thumbnail: fields.thumbnail,
      };
    });

    return setCacheData(cacheKey, videos);
  } catch (error) {
    console.error('Error fetching featured videos:', error);
    return [];
  }
};

export const getVideoListingPage = async (): Promise<VideoListingPage | null> => {
  const cacheKey = 'video_listing_page';
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await client.getEntries({
      content_type: 'videoListingPage',
      limit: 1,
    });

    if (response.items.length === 0) {
      return null;
    }

    const page = response.items[0];
    const fields = page.fields || {};

    const transformedPage: VideoListingPage = {
      fields: {
        ...fields
      },
    };

    return setCacheData(cacheKey, transformedPage);
  } catch (error) {
    console.error('Error fetching video listing page:', error);
    return null;
  }
};

export default client; 