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
          className="carousel-cta inline-flex items-center px-10 py-5 border border-transparent text-lg font-medium rounded-md shadow-lg text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
        >
          {ctaLabel}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 ml-2" 
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
          className="carousel-cta inline-flex items-center px-10 py-5 border border-transparent text-lg font-medium rounded-md shadow-lg text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
        >
          {ctaLabel}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 ml-2" 
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
          className="carousel-cta inline-flex items-center px-10 py-5 border border-transparent text-lg font-medium rounded-md shadow-lg text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
        >
          {ctaLabel}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 ml-2" 
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
      className={`carousel-item w-full relative h-[700px] md:h-[800px] lg:h-[900px] xl:h-screen ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}
      aria-hidden={ariaHidden}
      style={{ position: 'absolute', left: 0, top: 0, width: '100%' }}
    >
      {/* Mobile Layout - Stack Content Below Image */}
      <div className="md:hidden flex flex-col h-full">
        {/* Background Image - No overlay for mobile */}
        <div className="relative w-full h-[400px]">
          <Image
            src={image}
            alt={altText}
            fill
            sizes="100vw"
            className="object-cover"
            priority={true}
            quality={90}
          />
          {/* Removed gradient overlay for mobile */}
        </div>
        
        {/* Content section - Full width for mobile */}
        <div className="flex-1 w-full px-4 py-8 bg-gray-900">
          <div className="carousel-content w-full">
            <h2 className="text-4xl font-bold text-white mb-6">{heading}</h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">{summary}</p>
            {renderCTAButton()}
          </div>
        </div>
      </div>
      
      {/* Desktop Layout - Content Overlay on Image */}
      <div className="hidden md:block absolute inset-0 w-full h-full">
        <Image
          src={image}
          alt={altText}
          fill
          sizes="100vw"
          className="object-cover"
          priority={true}
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        
        {/* Content overlay for desktop */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-full flex flex-col justify-center">
          <div className="carousel-content max-w-xl md:max-w-2xl lg:max-w-3xl py-8 px-6 sm:px-8 lg:px-10 bg-black/10 backdrop-blur-sm rounded-lg">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 drop-shadow-lg">{heading}</h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 drop-shadow-md leading-relaxed">{summary}</p>
            {renderCTAButton()}
          </div>
        </div>
      </div>
    </div>
  );
} 