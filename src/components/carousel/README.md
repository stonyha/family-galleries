# Feature Carousel Component

A reusable carousel/slider component that displays featured content items with images, headings, summaries, and call-to-action buttons.

## Features

- Responsive design for desktop and mobile
- Accessible keyboard navigation
- Support for auto-advancing slides
- Optional lightbox/modal for images
- Smooth transition animations
- Lazy loading of images

## Contentful Setup

### 1. Create a Content Model in Contentful

Create a new content type in Contentful named `featureCarouselItem` with the following fields:

| Field Name | Field ID | Field Type | Required | Description |
|------------|----------|------------|----------|-------------|
| Heading | heading | Short text | Yes | Main heading for the carousel item |
| Summary | summary | Long text | Yes | Brief description text |
| CTA Label | ctaLabel | Short text | Yes | Text for the call-to-action button |
| CTA Link | ctaLink | Short text | Yes | URL for the CTA button (can be relative path) |
| Image | image | Media - Image | Yes | Featured image for the carousel item |
| Order | order | Number | Yes | Controls the order items appear in the carousel |

### 2. Add Content

Create multiple entries using the new content type. Each entry will represent a slide in the carousel.

## Component Usage

```tsx
import FeatureCarousel from '@/components/carousel/FeatureCarousel';
import { getFeatureCarouselItems } from '@/lib/contentful';

// In your page component:
export default async function SomePage() {
  const featureCarouselItems = await getFeatureCarouselItems();
  
  return (
    <div>
      {/* Your other components */}
      
      <FeatureCarousel 
        items={featureCarouselItems}
        autoAdvance={true}
        autoAdvanceInterval={8000}
        enableLightbox={true}
      />
      
      {/* More components */}
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | FeatureItem[] | required | Array of carousel items from Contentful |
| autoAdvance | boolean | true | Whether to automatically advance slides |
| autoAdvanceInterval | number | 8000 | Time in ms between auto-advances |
| enableLightbox | boolean | false | Enable image lightbox on click |

## Styling

The component uses Tailwind CSS for styling. Custom animations are defined in `src/app/globals.css`. 