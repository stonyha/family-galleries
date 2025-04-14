import { Asset, Entry } from 'contentful';

// Define our content types without strictly enforcing Contentful's type system
export interface GalleryFields {
  title: string;
  slug: string;
  description?: string;
  eventDate: string;
  coverImage: Asset;
  images: Asset[];
  location?: string;
  tags?: string[];
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

// Use type assertion when working with the actual Contentful API
export type Gallery = any; // We'll use type assertion when needed
export type HomePage = any;
export type AboutPage = any;

export interface GalleryCollection {
  items: any[]; // Will be cast to the right types when used
  total: number;
  skip: number;
  limit: number;
} 