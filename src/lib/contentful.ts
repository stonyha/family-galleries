import { createClient } from 'contentful';

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
    order: '-fields.eventDate',
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
      order: '-fields.eventDate',
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

export default client; 