import { useEffect, useState } from 'react';
import { projectTitleClasses, projectTitleContainerClasses } from '../utils/sharedStyles';
import { getResponsiveFontSizes } from '../config/pocketbase';
import type { Settings } from '../config/pocketbase';

type CSSProjectTitleProps = {
  title: string;
  carouselRef: React.RefObject<HTMLDivElement | null>;
  mediaItems: { src: string }[];
  onNextSection?: () => void;
  onShowPopup?: (title: string) => void;
  isPopupVisible?: boolean;
  isAboutPopupVisible?: boolean;
  settingsData?: Settings | null;
};

export default function CSSProjectTitle({
  title,
  carouselRef,
  mediaItems,
  onNextSection,
  onShowPopup,
  isPopupVisible = false,
  isAboutPopupVisible = false,
  settingsData = null
}: CSSProjectTitleProps) {
  const [isOnBlurSlide, setIsOnBlurSlide] = useState(false);
  
  // Get dynamic font sizes from settings
  const fontSizes = getResponsiveFontSizes(settingsData);
  
  // Listen to carousel scroll to detect blur slide
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const containerWidth = carousel.offsetWidth;
      const isDesktop = window.innerWidth >= 1024;
      
      let currentIndex = 0;
      
      if (isDesktop) {
        // Desktop: Mixed slide widths - calculate based on slide positions
        // Slides 0 to mediaItems.length-1: 50% width
        // Transparent slide (mediaItems.length): 50% width  
        // Blur slide (mediaItems.length+1): 100% width
        
        const halfWidth = containerWidth * 0.5;
        const fullWidth = containerWidth;
        
        // Calculate cumulative positions
        let accumulatedWidth = 0;
        const totalSlides = mediaItems.length + 2; // +1 for transparent, +1 for blur
        
        for (let i = 0; i < totalSlides; i++) {
          const slideWidth = (i === totalSlides - 1) ? fullWidth : halfWidth; // Only blur slide is full width
          const slideCenter = accumulatedWidth + (slideWidth / 2);
          
          if (scrollLeft + (containerWidth / 2) <= slideCenter + (slideWidth / 4)) {
            currentIndex = i;
            break;
          }
          
          accumulatedWidth += slideWidth;
        }
      } else {
        // Mobile/Tablet: Simple slide detection based on scroll position
        const totalSlides = mediaItems.length + 2; // +1 transparent, +1 blur
        const maxScroll = carousel.scrollWidth - containerWidth;
        const scrollPercentage = scrollLeft / maxScroll;
        
        // Map scroll percentage to slide index
        currentIndex = Math.round(scrollPercentage * (totalSlides - 1));
        currentIndex = Math.max(0, Math.min(currentIndex, totalSlides - 1));
      }
      
      const totalSlides = mediaItems.length + 2; // +1 for transparent, +1 for blur
      const isBlur = currentIndex === totalSlides - 1;
      setIsOnBlurSlide(isBlur);
    };

    carousel.addEventListener('scroll', handleScroll, { passive: true });
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, [carouselRef, mediaItems.length]);

  const handleClick = () => {
    if (isOnBlurSlide) {
      onNextSection?.();
    } else {
      onShowPopup?.(title);
    }
  };

  return (
    <>
      <style>{`
        .css-project-title {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          z-index: 200;
          pointer-events: none;
        }
        
        /* Desktop: Use 80% width to match navigation */
        @media (min-width: 768px) {
          .css-project-title {
            width: 80%;
          }
        }
        
        .css-project-title__content {
          pointer-events: auto;
          text-align: center;
          color: white;
          cursor: pointer;
          
          transition: opacity 0.3s ease-in-out;
          
          /* Dynamic font sizing */
          font-size: ${fontSizes.mobile}rem;
        }
        
        @media (min-width: 768px) {
          .css-project-title__content {
            font-size: ${fontSizes.tablet}rem;
          }
        }
        
        @media (min-width: 1024px) {
          .css-project-title__content {
            font-size: ${fontSizes.desktop}rem;
          }
        }
        
        @media (min-width: 1280px) {
          .css-project-title__content {
            font-size: ${fontSizes.largeDesktop}rem;
          }
        }
        
        .css-project-title__content:hover {
          opacity: 0.8;
        }
      `}</style>
      
      <div className="css-project-title">
        <div 
          className={`css-project-title__content ${projectTitleClasses} ${projectTitleContainerClasses}`}
          onClick={handleClick}
          style={{
            fontFamily: 'EnduroWeb, sans-serif',
            letterSpacing: '0.03em',
            opacity: isPopupVisible || isAboutPopupVisible ? 0 : 1,
            visibility: isPopupVisible || isAboutPopupVisible ? 'hidden' : 'visible',
            transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
          }}
        >
          {isOnBlurSlide ? 'NEXT PROJECT' : title}
        </div>
      </div>
    </>
  );
}