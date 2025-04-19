import Image from 'next/image';
import Link from 'next/link';
import { FeatureItem } from './FeatureCarousel';

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
  const { heading, summary, ctaLabel, ctaLink, image, altText } = item;

  // Function to determine if we should use Link or anchor
  // Ensure ctaLink is a string before calling startsWith
  const isExternalLink = typeof ctaLink === 'string' && 
    (ctaLink.startsWith('http:') || ctaLink.startsWith('https:'));
  const isAnchor = ctaLink === '#' || 
    (typeof ctaLink === 'string' && ctaLink.startsWith('#'));

  // Render the appropriate button based on link type
  const renderCTAButton = () => {
    if (isExternalLink) {
      return (
        <a
          href={ctaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="carousel-cta inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
        >
          {ctaLabel}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 ml-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </a>
      );
    } else if (isAnchor) {
      return (
        <a
          href={ctaLink || '#'}
          className="carousel-cta inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
        >
          {ctaLabel}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 ml-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </a>
      );
    } else {
      return (
        <Link
          href={ctaLink || '#'}
          className="carousel-cta inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
        >
          {ctaLabel}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 ml-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </Link>
      );
    }
  };

  return (
    <div 
      className="carousel-item relative h-full"
      aria-hidden={ariaHidden}
    >
      {/* Full-screen background image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={image}
          alt={altText}
          fill
          sizes="100vw"
          className="object-cover"
          priority={isActive}
          quality={90}
        />
        {/* Removed the dark overlay for better image visibility */}
      </div>
      
      {/* Content section - repositioned to bottom left */}
      <div className="absolute bottom-0 left-0 p-6 md:p-8 lg:p-10 max-w-xl text-left">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg">{heading}</h2>
        <p className="text-base md:text-lg text-white/90 mb-4 md:mb-6 max-w-md drop-shadow-md">{summary}</p>
        <div className="mt-4">
          {renderCTAButton()}
        </div>
      </div>
    </div>
  );
} 