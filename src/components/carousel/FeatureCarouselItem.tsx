import Image from 'next/image';
import Link from 'next/link';
import { FeatureItem } from './FeatureCarousel';
import { useEffect, useState, useRef } from 'react';

type FeatureCarouselItemProps = {
  item: FeatureItem;
  isActive: boolean;
  'aria-hidden'?: boolean;
};

export default function FeatureCarouselItem({
  item,
  isActive,
  'aria-hidden': ariaHidden = !isActive,
}: FeatureCarouselItemProps) {
  const { ctaLink, image, imageMobile } = item;
  const [isMobile, setIsMobile] = useState(false);
  const [imageToUse, setImageToUse] = useState(image);
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Reset any hover styles when active state changes
  useEffect(() => {
    if (itemRef.current && !isActive) {
      // Force blur on any focusable elements
      const focusableElements = itemRef.current.querySelectorAll('a, button');
      focusableElements.forEach(element => {
        (element as HTMLElement).blur();
      });
    }
  }, [isActive]);

  // Check if we're on a mobile device and update the image accordingly
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768; // 768px is typical md breakpoint
      setIsMobile(isMobileView);
      
      // Update the image based on screen size
      if (isMobileView && imageMobile) {
        // Check if imageMobile is an array with at least one element
        if (Array.isArray(imageMobile) && imageMobile.length > 0 && imageMobile[0].secure_url) {
          setImageToUse(imageMobile[0].secure_url as string);
        } 
        // Check if imageMobile is an object with secure_url property
        else if (typeof imageMobile === 'object' && imageMobile !== null && 'secure_url' in imageMobile) {
          setImageToUse((imageMobile as { secure_url: string }).secure_url);
        }
        // If imageMobile exists but doesn't have the expected structure, use desktop image
        else {
          setImageToUse(image);
        }
      } else {
        setImageToUse(image);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [image, imageMobile]);

  // Check if ctaLink exists and is a valid URL or path
  const hasValidLink = Boolean(ctaLink && typeof ctaLink === 'string' && ctaLink.trim() !== '');

  // Function to create the image element
  const imageElement = (
    <div className="absolute inset-0 w-full h-full">
      <Image
        src={imageToUse}
        alt="Carousel image"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        className="object-cover"
        priority={isActive}
        quality={85}
      />
    </div>
  );

  // Link styles to prevent any hover effects
  const linkStyle = "absolute inset-0 w-full h-full block cursor-pointer z-10 focus:outline-none focus:ring-1 focus:ring-white hover:bg-transparent";

  // Function to determine the appropriate content based on link presence
  const renderContent = () => {
    if (!hasValidLink) {
      return null;
    }

    const isExternalLink = ctaLink.startsWith('http:') || ctaLink.startsWith('https:');
    
    if (isExternalLink) {
      return (
        <a 
          href={ctaLink}
          target="_blank" 
          rel="noopener noreferrer"
          className={linkStyle}
          aria-label="View more details"
          onClick={(e) => e.currentTarget.blur()}
          tabIndex={isActive ? 0 : -1}
          style={{ backgroundColor: 'transparent' }}
        >
          <span className="sr-only">View more details</span>
        </a>
      );
    }
    
    return (
      <Link 
        href={ctaLink}
        className={linkStyle}
        aria-label="View more details"
        onClick={(e) => e.currentTarget.blur()}
        tabIndex={isActive ? 0 : -1}
        style={{ backgroundColor: 'transparent' }}
      >
        <span className="sr-only">View more details</span>
      </Link>
    );
  };

  return (
    <div 
      ref={itemRef}
      className="carousel-item relative h-full w-full"
      aria-hidden={ariaHidden}
    >
      {imageElement}
      {hasValidLink && renderContent()}
    </div>
  );
} 