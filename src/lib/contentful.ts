import { createClient } from 'contentful';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || '',
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
});

export const getGalleries = async () => {
  const response = await client.getEntries({
    content_type: 'gallery',
    order: '-fields.eventDate',
  });
  
  return response.items;
};

export const getGalleryBySlug = async (slug: string) => {
  const response = await client.getEntries({
    content_type: 'gallery',
    'fields.slug': slug,
    limit: 1,
  });
  
  return response.items[0];
};

export const getHomePage = async () => {
  const response = await client.getEntries({
    content_type: 'homePage',
    limit: 1,
  });
  
  return response.items[0];
};

export const getAboutPage = async () => {
  const response = await client.getEntries({
    content_type: 'aboutPage',
    limit: 1,
  });
  
  return response.items[0];
};

export const getFeaturedGalleries = async (limit = 3) => {
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
    
    return response.items;
  }
  
  const response = await client.getEntries({
    content_type: 'gallery',
    'sys.id[in]': featuredGalleryIds.join(','),
    limit: featuredGalleryIds.length,
  });
  
  return response.items;
};

export default client; 