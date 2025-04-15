"use client";

import Image from 'next/image';
import { useState, useEffect, useRef, useMemo } from 'react';
import Masonry from 'react-masonry-css';

type PhotoGridProps = {
  images: any[]; // Contentful assets
};

// Interface for keeping track of clicked image position
interface ImagePosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Interface for tracking touch positions
interface TouchPosition {
  x: number;
  y: number;
}

export default function PhotoGrid({ images }: PhotoGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [sourcePosition, setSourcePosition] = useState<ImagePosition | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lightboxImageRef = useRef<HTMLDivElement>(null);
  const lightboxContentRef = useRef<HTMLImageElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Minimum swipe distance in pixels to trigger navigation
  const MIN_SWIPE_DISTANCE = 30;
  
  // Handle touch start event
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  };
  
  // Handle touch move event
  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStart || !e.touches || e.touches.length === 0) return;
    
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
    
    // Prevent default to avoid scrolling while swiping in the lightbox
    e.preventDefault();
  };
  
  // Handle touch end event
  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    if (isHorizontalSwipe && Math.abs(distanceX) > MIN_SWIPE_DISTANCE) {
      if (distanceX > 0) {
        // Swiped left, go to next image
        goToNext();
      } else {
        // Swiped right, go to previous image
        goToPrevious();
      }
    } else if (!isHorizontalSwipe && distanceY < -MIN_SWIPE_DISTANCE) {
      // Swiped down, close the lightbox
      // We use a negative value since distanceY is calculated as touchStart.y - touchEnd.y
      // So a downward swipe gives a negative value
      closeLightbox();
    }
    
    // Reset touch positions
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  useEffect(() => {
    // Reset images loaded count when images array changes
    setImagesLoaded(0);
    setLoadedImages({});
  }, [images]);
  
  // Process image dimensions for better layout
  const processedImages = useMemo(() => {
    return images.map(image => {
      const width = image?.fields?.file?.details?.image?.width || 800;
      const height = image?.fields?.file?.details?.image?.height || 600;
      const aspectRatio = height / width;
      
      // Calculate display dimensions that maintain aspect ratio
      // This helps prevent layout shifts and creates a more balanced grid
      const displayWidth = 800;
      const displayHeight = Math.round(displayWidth * aspectRatio);
      
      return {
        ...image,
        displayWidth,
        displayHeight,
        aspectRatio
      };
    });
  }, [images]);
  
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
    
    // Observe all gallery items
    const photoItems = gridRef.current.querySelectorAll('.gallery-item');
    photoItems.forEach((item) => observer.observe(item));
    
    return () => {
      photoItems.forEach((item) => observer.unobserve(item));
    };
  }, [images, imagesLoaded]);
  
  // Handle image change during navigation
  useEffect(() => {
    if (nextImageIndex !== null && lightboxOpen) {
      // Apply appropriate animation class based on slide direction
      if (lightboxContentRef.current) {
        const animationClass = slideDirection === 'left' 
          ? 'slide-in-left' 
          : 'slide-in-right';
          
        lightboxContentRef.current.classList.add(animationClass);
        
        // Clean up animation class after it completes
        const timer = setTimeout(() => {
          if (lightboxContentRef.current) {
            lightboxContentRef.current.classList.remove(animationClass);
          }
          setIsTransitioning(false);
          setNextImageIndex(null);
        }, 400);
        
        return () => clearTimeout(timer);
      }
    }
  }, [nextImageIndex, lightboxOpen, slideDirection]);
  
  // Setup touch event handlers with passive: false option
  useEffect(() => {
    if (lightboxOpen && lightboxRef.current) {
      const lightboxElement = lightboxRef.current;
      
      // Add event listeners with the passive: false option
      lightboxElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      lightboxElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      lightboxElement.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      // Clean up
      return () => {
        lightboxElement.removeEventListener('touchstart', handleTouchStart);
        lightboxElement.removeEventListener('touchmove', handleTouchMove);
        lightboxElement.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [lightboxOpen, touchStart, touchEnd]);
  
  const openLightbox = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
    // Get the position of the clicked image for animation
    const rect = event.currentTarget.getBoundingClientRect();
    setSourcePosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    });
    
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
    
    // Calculate transform origin based on the clicked image position
    // This makes the animation start from the correct position
    setTimeout(() => {
      if (lightboxImageRef.current) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const originX = centerX - (rect.left + rect.width / 2);
        const originY = centerY - (rect.top + rect.height / 2);
        
        // Set transform origin relative to the center of the viewport
        lightboxImageRef.current.style.transformOrigin = `calc(50% - ${originX}px) calc(50% - ${originY}px)`;
        lightboxImageRef.current.classList.add('lightbox-image-transition');
      }
    }, 0);
  };
  
  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
    
    // Clear source position after animation completes
    setTimeout(() => {
      setSourcePosition(null);
      if (lightboxImageRef.current) {
        lightboxImageRef.current.classList.remove('lightbox-image-transition');
      }
    }, 300);
  };
  
  const goToPrevious = () => {
    if (isTransitioning) return; // Prevent rapid clicks during transition
    
    setIsTransitioning(true);
    setSlideDirection('left');
    
    // Calculate the next image index
    const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    
    // Add fade-out animation
    if (lightboxContentRef.current) {
      lightboxContentRef.current.classList.add('fade-out');
    }
    
    // Wait for fade-out to complete before changing the image
    setTimeout(() => {
      // Set the current image to the previous one
      setCurrentImageIndex(prevIndex);
      // Clear the fade-out class
      if (lightboxContentRef.current) {
        lightboxContentRef.current.classList.remove('fade-out');
      }
      // Signal that we're ready to show the new image with animation
      setNextImageIndex(prevIndex);
    }, 200);
  };
  
  const goToNext = () => {
    if (isTransitioning) return; // Prevent rapid clicks during transition
    
    setIsTransitioning(true);
    setSlideDirection('right');
    
    // Calculate the next image index
    const nextIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
    
    // Add fade-out animation
    if (lightboxContentRef.current) {
      lightboxContentRef.current.classList.add('fade-out');
    }
    
    // Wait for fade-out to complete before changing the image
    setTimeout(() => {
      // Set the current image to the next one
      setCurrentImageIndex(nextIndex);
      // Clear the fade-out class
      if (lightboxContentRef.current) {
        lightboxContentRef.current.classList.remove('fade-out');
      }
      // Signal that we're ready to show the new image with animation
      setNextImageIndex(nextIndex);
    }, 200);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };
  
  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => prev + 1);
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };
  
  // Define breakpoints for the masonry grid with better column distribution
  const breakpointColumnsObj = {
    default: 4, // 4 columns for large desktop (1280px+)
    1279: 3,    // 3 columns for regular desktop (1024-1279px)
    1023: 2,    // 2 columns for tablets (768-1023px)
    767: 1      // 1 column for mobile (<768px)
  };
  
  // Focus trap for lightbox
  useEffect(() => {
    if (lightboxOpen && lightboxRef.current) {
      lightboxRef.current.focus();
    }
  }, [lightboxOpen]);
  
  // Get current Contentful image data
  const currentImage = images[currentImageIndex];
  const imageUrl = currentImage?.fields?.file?.url || '';
  const imageAlt = currentImage?.fields?.title || `Photo ${currentImageIndex + 1}`;
  const imageTitle = currentImage?.fields?.title || `Photo ${currentImageIndex + 1} of ${images.length}`;
  
  // Add media query to show arrows on larger screens
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const updateArrowVisibility = () => {
        const buttons = document.querySelectorAll('.lightbox-controls');
        if (window.innerWidth >= 768) { // md breakpoint
          buttons.forEach(btn => {
            if (btn instanceof HTMLElement) {
              btn.style.display = 'flex';
            }
          });
        } else {
          buttons.forEach(btn => {
            if (btn instanceof HTMLElement) {
              btn.style.display = 'none';
            }
          });
        }
      };
      
      // Initial update
      updateArrowVisibility();
      
      // Update on resize
      window.addEventListener('resize', updateArrowVisibility);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', updateArrowVisibility);
      };
    }
  }, [lightboxOpen]);
  
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
            const imageUrl = image?.fields?.file?.url || '';
            const imageAlt = image?.fields?.title || `Photo ${index + 1}`;
            
            return (
              <div 
                key={image.sys.id} 
                className="gallery-item opacity-0"
                onClick={(e) => openLightbox(index, e)}
              >
                {imageUrl && (
                  <div className="relative rounded-lg overflow-hidden">
                    <Image
                      src={`https:${imageUrl}`}
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
      {lightboxOpen && (
        <div 
          ref={lightboxRef}
          className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center lightbox-overlay"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          style={{ 
            willChange: 'opacity',
            transform: 'translateZ(0)'
          }}
        >
          <button
            className="absolute top-4 right-4 text-white z-[10000] p-2 lightbox-controls
            bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Close lightbox"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none"
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
          
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 lightbox-controls 
            bg-black bg-opacity-50 rounded-full z-10 w-10 h-10 items-center justify-center
            md:w-12 md:h-12 hover:bg-opacity-70 transition-all"
            style={{ display: 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            disabled={isTransitioning}
            aria-label="Previous image"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
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
          </button>
          
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 lightbox-controls
            bg-black bg-opacity-50 rounded-full z-10 w-10 h-10 items-center justify-center
            md:w-12 md:h-12 hover:bg-opacity-70 transition-all"
            style={{ display: 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            disabled={isTransitioning}
            aria-label="Next image"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </button>
          
          <div 
            ref={lightboxImageRef}
            className="h-full w-full md:h-auto md:max-h-[90vh] md:max-w-[90vw] relative lightbox-content"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              perspective: 1000
            }}
          >
            {imageUrl && (
              <Image
                ref={lightboxContentRef as any}
                key={`lightbox-image-${currentImageIndex}`}
                src={`https:${imageUrl}`}
                alt={imageAlt}
                width={1200}
                height={800}
                className="h-full w-full md:h-auto md:max-h-[90vh] object-contain"
                priority={true}
                quality={90}
                style={{ 
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden'
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
} 