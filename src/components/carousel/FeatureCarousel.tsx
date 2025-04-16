"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import FeatureCarouselItem from './FeatureCarouselItem';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export type FeatureItem = {
  id: string;
  heading: string;
  summary: string;
  ctaLabel: string;
  ctaLink: string;
  image: string;
  altText: string;
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Function to advance to the next slide
  const nextSlide = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  // Function to go to the previous slide
  const prevSlide = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  }, [items.length]);

  // Navigate to a specific slide
  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Reset timer when active index changes
  useEffect(() => {
    if (autoAdvance && !isPaused) {
      resetTimer();
    }
    // Announce slide change to screen readers
    const announcement = document.getElementById('carousel-live-region');
    if (announcement) {
      announcement.textContent = `Showing slide ${activeIndex + 1} of ${items.length}: ${items[activeIndex].heading}`;
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
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
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
      className="feature-carousel"
      ref={carouselRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Feature highlights"
      tabIndex={0}
    >
      {/* Visually hidden live region for screen readers */}
      <div 
        id="carousel-live-region"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      ></div>
      
      <div className="carousel-container">
        <div className="carousel-items">
          {items.map((item, index) => (
            <FeatureCarouselItem
              key={item.id}
              item={item}
              isActive={index === activeIndex}
              aria-hidden={index !== activeIndex}
            />
          ))}
        </div>
        
        {/* Navigation buttons */}
        <button
          className="carousel-nav-btn absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        
        <button
          className="carousel-nav-btn absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>
      
      {/* Slide indicators */}
      <div className="carousel-indicators absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            className="h-3 w-3 rounded-full bg-white/50"
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={index === activeIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default FeatureCarousel; 