import { useState, useEffect, useRef } from 'react';
import SwipeCarousel from './SwipeCarousel';
import CSSCarousel from './CSSCarousel';
import CSSProjectTitle from './CSSProjectTitle';

// --- Type Definitions ---
type MediaItem = {
  src: string;
};

type CarouselWrapperProps = {
  mediaItems: MediaItem[];
  onActiveIndexChange?: (index: number) => void;
  isFirstCarousel?: boolean;
  forceCSSCarousel?: boolean; // For testing purposes
  projectTitle?: string;
  onNextSection?: () => void;
  onShowPopup?: (title: string) => void;
  isPopupVisible?: boolean;
  isAboutPopupVisible?: boolean;
};

// --- Feature Detection ---
function supportsCSSCarousel(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check for scroll-state() support
    const supportsScrollState = CSS.supports('container-type', 'scroll-state');
    
    // Check for scroll-marker support
    const supportsScrollMarker = CSS.supports('scroll-marker-group', 'after');
    
    // Check for scroll-button support (this might not be detectable yet)
    // For now, we'll assume it comes with scroll-state support
    
    return supportsScrollState && supportsScrollMarker;
  } catch (e) {
    return false;
  }
}

// --- Carousel Wrapper Component ---
export default function CarouselWrapper({ 
  mediaItems, 
  onActiveIndexChange, 
  isFirstCarousel = false,
  forceCSSCarousel = false,
  projectTitle,
  onNextSection,
  onShowPopup,
  isPopupVisible = false,
  isAboutPopupVisible = false
}: CarouselWrapperProps) {
  const [useCSSCarousel, setUseCSSCarousel] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Feature detection
    const cssSupported = supportsCSSCarousel();
    
    // For testing: allow forcing CSS carousel even without support
    setUseCSSCarousel(forceCSSCarousel || cssSupported);
    
    // Debug logging
    console.log('CSS Carousel Support:', {
      scrollState: CSS.supports('container-type', 'scroll-state'),
      scrollMarker: CSS.supports('scroll-marker-group', 'after'),
      willUseCSSCarousel: forceCSSCarousel || cssSupported
    });
  }, [forceCSSCarousel]);

  // Server-side rendering fallback
  if (!isClient) {
    return (
      <SwipeCarousel 
        mediaItems={mediaItems}
        onActiveIndexChange={onActiveIndexChange}
        isFirstCarousel={isFirstCarousel}
      />
    );
  }

  // Choose implementation
  if (useCSSCarousel) {
    return (
      <div className="relative h-full w-full">
        <CSSCarousel 
          ref={carouselRef}
          mediaItems={mediaItems}
          onActiveIndexChange={onActiveIndexChange}
          isFirstCarousel={isFirstCarousel}
        />
        {projectTitle && (
          <CSSProjectTitle 
            title={projectTitle}
            carouselRef={carouselRef}
            mediaItems={mediaItems}
            onNextSection={onNextSection}
            onShowPopup={onShowPopup}
            isPopupVisible={isPopupVisible}
            isAboutPopupVisible={isAboutPopupVisible}
          />
        )}
      </div>
    );
  }

  return (
    <SwipeCarousel 
      mediaItems={mediaItems}
      onActiveIndexChange={onActiveIndexChange}
      isFirstCarousel={isFirstCarousel}
    />
  );
}

// --- Export feature detection for external use ---
export { supportsCSSCarousel };