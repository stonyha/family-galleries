"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import FeatureCarouselItem from './FeatureCarouselItem';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export type FeatureItem = {
  id: string;
  image: string;
  imageMobile?: Array<{
    secure_url: string;
    width: number;
    height: number;
    [key: string]: any; // Allow for other properties that might be in the object
  }>;
  ctaLink: string;
};

type FeatureCarouselProps = {
  items: FeatureItem[];
  autoAdvance?: boolean;
  interval?: number;
};

const FeatureCarousel: React.FC<FeatureCarouselProps> = ({
  items,
  autoAdvance = true,
  interval = 5000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Function to advance to the next slide
  const nextSlide = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
    // Reset hover state when slide changes
    setIsHovering(false);
  }, [items.length]);

  // Function to go to the previous slide
  const prevSlide = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    // Reset hover state when slide changes
    setIsHovering(false);
  }, [items.length]);

  // Navigate to a specific slide
  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    // Reset hover state when slide changes
    setIsHovering(false);
  }, []);

  // Reset timer when active index changes
  useEffect(() => {
    if (autoAdvance && !isPaused) {
      resetTimer();
    }
    // Announce slide change to screen readers
    const announcement = document.getElementById('carousel-live-region');
    if (announcement) {
      announcement.textContent = `Showing slide ${activeIndex + 1} of ${items.length}`;
    }
  }, [activeIndex, autoAdvance, interval, isPaused, items]);

  // Clear timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Setup keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === carouselRef.current || carouselRef.current?.contains(document.activeElement)) {
        switch (e.key) {
          case 'ArrowLeft':
            prevSlide();
            e.preventDefault();
            break;
          case 'ArrowRight':
            nextSlide();
            e.preventDefault();
            break;
          case 'Home':
            goToSlide(0);
            e.preventDefault();
            break;
          case 'End':
            goToSlide(items.length - 1);
            e.preventDefault();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToSlide, items.length, nextSlide, prevSlide]);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      nextSlide();
    }, interval);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
    setIsHovering(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setIsHovering(false);
    if (autoAdvance) {
      resetTimer();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      const threshold = 50; // Minimum swipe distance

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Swipe left - go to next slide
          nextSlide();
        } else {
          // Swipe right - go to previous slide
          prevSlide();
        }
      }
    }
    
    // Reset touch coordinates
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div 
      className={`feature-carousel relative w-full aspect-[5/4] md:aspect-auto md:h-full ${isHovering ? 'hover' : ''}`}
      ref={carouselRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Feature images"
      tabIndex={0}
    >
      {/* Visually hidden live region for screen readers */}
      <div 
        id="carousel-live-region"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      ></div>
      
      <div className="carousel-container relative w-full h-full overflow-hidden">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className={`carousel-item-wrapper absolute w-full h-full transition-opacity duration-500 ease-in-out ${
              index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            aria-hidden={index !== activeIndex}
          >
            <FeatureCarouselItem
              item={item}
              isActive={index === activeIndex}
              aria-hidden={index !== activeIndex}
            />
          </div>
        ))}
        
        {/* Navigation buttons - visibility based on hover state and screen size */}
        {items.length > 1 && (
          <>
            <button
              className={`carousel-nav-btn hidden sm:flex absolute left-4 top-1/2 z-20 h-10 w-10 md:h-12 md:w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white ${isHovering ? 'opacity-100' : 'opacity-0'} hover:bg-black/60 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all duration-300`}
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="h-6 w-6 md:h-8 md:w-8" />
            </button>
            
            <button
              className={`carousel-nav-btn hidden sm:flex absolute right-4 top-1/2 z-20 h-10 w-10 md:h-12 md:w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white ${isHovering ? 'opacity-100' : 'opacity-0'} hover:bg-black/60 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all duration-300`}
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRightIcon className="h-6 w-6 md:h-8 md:w-8" />
            </button>
          </>
        )}
      </div>
      
      {/* Slide indicators - show only if there are multiple slides */}
      {items.length > 1 && (
        <div className="carousel-indicators absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center space-x-2 z-20">
          {items.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'bg-amber-500 scale-125' : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === activeIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeatureCarousel; 