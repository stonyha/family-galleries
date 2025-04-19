import { Asset, Entry } from 'contentful';

// Define our content types without strictly enforcing Contentful's type system
export interface GalleryFields {
  title: string;
  slug: string;
  description?: string;
  eventDate: string;
  coverImage: Asset;
  thumbnail: Asset;
  images: Asset[];
  location?: string;
  tags?: string[];
  cloudImages?: CloudinaryImage[];
}

export interface HomePageFields {
  title: string;
  intro: string;
  heroImage?: Asset;
  featuredGalleries?: any[]; // Simplified to avoid circular references
}

export interface AboutPageFields {
  title: string;
  content: any; // RichText content
  familyImage?: Asset;
}

export interface FeatureCarouselItemFields {
  heading: string;
  summary: string;
  ctaLabel: string;
  ctaLink: string;
  image: Asset;
  order: number;
}

export interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  version: number;
}

// Use type assertion when working with the actual Contentful API
export type Gallery = any; // We'll use type assertion when needed
export type HomePage = any;
export type AboutPage = any;
export type FeatureCarouselItem = any;

export interface GalleryCollection {
  items: any[]; // Will be cast to the right types when used
  total: number;
  skip: number;
  limit: number;
} 