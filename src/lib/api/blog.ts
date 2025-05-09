import { createClient } from 'contentful';
import { Document } from '@contentful/rich-text-types';
import { Entry, EntrySkeletonType, Asset, AssetFields } from 'contentful';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

interface BlogPostFields {
  title: string;
  excerpt: string;
  slug: string;
  featuredImage: Asset<AssetFields>;
  publishDate: string;
  author: string;
  content: Document;
}

interface BlogPostSkeleton extends EntrySkeletonType {
  contentTypeId: 'blogPost';
  fields: BlogPostFields;
}

export interface BlogPost {
  title: string;
  excerpt: string;
  slug: string;
  featuredImage: {
    url: string;
    alt: string;
  };
  publishDate: string;
  author: string;
  content: Document;
}

function getImageUrl(item: Entry<BlogPostSkeleton>): { url: string; alt: string } {
  if (!item?.fields?.featuredImage?.fields?.file?.url) {
    return {
      url: '/images/placeholder.jpg', // You should add a placeholder image
      alt: 'No image available',
    };
  }

  return {
    url: `https:${item.fields.featuredImage.fields.file.url}`,
    alt: item.fields.featuredImage.fields.title || 'Blog post image',
  };
}

export async function getBlogPosts(page = 1, limit = 9) {
  const skip = (page - 1) * limit;

  const response = await client.getEntries<BlogPostSkeleton>({
    content_type: 'blogPost',
    order: ['-sys.createdAt'],
    limit,
    skip,
  });

  const totalPosts = response.total;
  const totalPages = Math.ceil(totalPosts / limit);

  const posts = response.items.map((item) => ({
    title: item.fields.title || '',
    excerpt: item.fields.excerpt || '',
    slug: item.fields.slug || '',
    featuredImage: getImageUrl(item),
    publishDate: item.fields.publishDate || '',
    author: item.fields.author || '',
    content: item.fields.content || {},
  }));

  return {
    posts,
    totalPages,
  };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const response = await client.getEntries<BlogPostSkeleton>({
    content_type: 'blogPost',
    'fields.slug': slug,
    limit: 1,
  });

  if (!response.items.length) {
    return null;
  }

  const item = response.items[0];
  return {
    title: item.fields.title || '',
    excerpt: item.fields.excerpt || '',
    slug: item.fields.slug || '',
    featuredImage: getImageUrl(item),
    publishDate: item.fields.publishDate || '',
    author: item.fields.author || '',
    content: item.fields.content || {},
  };
}

export async function getLatestBlogPosts(limit = 4) {
  const response = await client.getEntries<BlogPostSkeleton>({
    content_type: 'blogPost',
    order: ['-sys.createdAt'],
    limit,
  });

  return response.items.map((item) => ({
    title: item.fields.title || '',
    excerpt: item.fields.excerpt || '',
    slug: item.fields.slug || '',
    featuredImage: getImageUrl(item),
    publishDate: item.fields.publishDate || '',
    author: item.fields.author || '',
  }));
} 