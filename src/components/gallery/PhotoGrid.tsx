"use client";

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import Masonry from 'react-masonry-css';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Counter from 'yet-another-react-lightbox/plugins/counter';

type PhotoGridProps = {
  images: any[]; // Cloudinary images array
};

export default function PhotoGrid({ images }: PhotoGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const gridRef = useRef<HTMLDivElement>(null);

  // Process image dimensions for better layout
  const processedImages = images.map(image => {
    const width = image?.width || 800;
    const height = image?.height || 600;
    const aspectRatio = height / width;
    
    const displayWidth = 800;
    const displayHeight = Math.round(displayWidth * aspectRatio);
    
    return {
      ...image,
      displayWidth,
      displayHeight,
      aspectRatio
    };
  });

  // Set up intersection observer for animation on scroll
  useEffect(() => {
    if (!gridRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-up-item');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );
    
    const photoItems = gridRef.current.querySelectorAll('.gallery-item');
    photoItems.forEach((item) => observer.observe(item));
    
    return () => {
      photoItems.forEach((item) => observer.unobserve(item));
    };
  }, [images, imagesLoaded]);

  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => prev + 1);
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  // Define breakpoints for the masonry grid
  const breakpointColumnsObj = {
    default: 4,
    1279: 3,
    1023: 2,
    767: 1
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No photos found in this gallery</p>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-grid" ref={gridRef}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid-column"
        >
          {processedImages.map((image, index) => {
            const imageUrl = image?.secure_url || '';
            const imageAlt = image?.public_id || `Photo ${index + 1}`;
            
            return (
              <div 
                key={image.public_id} 
                className="gallery-item opacity-0"
                onClick={() => {
                  setCurrentImageIndex(index);
                  setLightboxOpen(true);
                }}
              >
                {imageUrl && (
                  <div className="relative rounded-lg overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={imageAlt}
                      width={image.displayWidth}
                      height={image.displayHeight}
                      className="w-full h-auto"
                      sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
                      loading="lazy"
                      quality={85}
                      onLoad={() => handleImageLoad(index)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </Masonry>
      </div>
      
      {/* Loading indicator */}
      {imagesLoaded < images.length && (
        <div className="text-center py-6">
          <p className="text-gray-500 loading-pulse">
            Loading {imagesLoaded} of {images.length} images...
          </p>
        </div>
      )}
      
      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={currentImageIndex}
        slides={processedImages.map(image => ({
          src: image.secure_url,
          alt: image.public_id || 'Gallery image'
        }))}
        styles={{ 
          container: { 
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999
          }
        }}
        carousel={{
          spacing: 0,
          padding: 0
        }}
        animation={{ fade: 300 }}
        controller={{ 
          closeOnBackdropClick: true,
          closeOnPullDown: true, // Enable swipe down to close
          closeOnPullUp: true,   // Enable swipe up to close
        }}
        plugins={[
          Fullscreen,
          Slideshow,
          Thumbnails,
          Zoom,
          Counter
        ]}
        zoom={{
          maxZoomPixelRatio: 2,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          scrollToZoom: true
        }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
          iconPrev: () => null,
          iconNext: () => null
        }}
      />
    </>
  );
} 