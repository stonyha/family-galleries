"use client";

import { useEffect, useRef } from 'react';
import GalleryCard from './GalleryCard';

type GalleryGridProps = {
  galleries: any[]; // We'll cast this to our Contentful types when used
  title?: string;
  emptyMessage?: string;
};

export default function GalleryGrid({ 
  galleries, 
  title, 
  emptyMessage = 'No galleries found' 
}: GalleryGridProps) {
  const galleryGridRef = useRef<HTMLDivElement>(null);
  
  // Set up intersection observer for animation on scroll
  useEffect(() => {
    if (!galleryGridRef.current) return;
    
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
    const galleryItems = galleryGridRef.current.querySelectorAll('.gallery-item-wrapper');
    galleryItems.forEach((item) => observer.observe(item));
    
    return () => {
      galleryItems.forEach((item) => observer.unobserve(item));
    };
  }, [galleries]);
  
  return (
    <div>
      {title && (
        <h2 className="text-2xl font-bold text-gray-800 mb-8">{title}</h2>
      )}
      
      {galleries.length > 0 ? (
        <div className="gallery-grid" ref={galleryGridRef}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleries.map((gallery, index) => (
              <div key={gallery.sys.id} className="gallery-item-wrapper opacity-0">
                <GalleryCard gallery={gallery} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
} 