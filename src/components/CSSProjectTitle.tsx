import { useRef, useEffect, useState } from 'react';

type CSSProjectTitleProps = {
  title: string;
  carouselRef: React.RefObject<HTMLDivElement | null>;
  mediaItems: { src: string }[];
  onNextSection?: () => void;
  onShowPopup?: (title: string) => void;
  isPopupVisible?: boolean;
  isAboutPopupVisible?: boolean;
};

export default function CSSProjectTitle({
  title,
  carouselRef,
  mediaItems,
  onNextSection,
  onShowPopup,
  isPopupVisible = false,
  isAboutPopupVisible = false
}: CSSProjectTitleProps) {
  const [isOnBlurSlide, setIsOnBlurSlide] = useState(false);
  
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
        // Mobile: All slides same width
        const slideWidth = containerWidth;
        currentIndex = Math.round(scrollLeft / slideWidth);
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
          max-width: 80%;
          z-index: 200;
          pointer-events: none;
        }
        
        .css-project-title__content {
          pointer-events: auto;
          text-align: center;
          color: white;
          padding: 12px 24px;
          cursor: pointer;
          
          /* Typography matching existing ProjectTitle */
          font-family: 'EnduroWeb', sans-serif;
          letter-spacing: 0.03em;
          font-size: clamp(1.25rem, 4vw, 3rem);
          line-height: 1;
          text-transform: uppercase;
          
          transition: opacity 0.3s ease-in-out;
        }
        
        .css-project-title__content:hover {
          opacity: 0.8;
        }
      `}</style>
      
      <div className="css-project-title">
        <div 
          className="css-project-title__content"
          onClick={handleClick}
          style={{
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