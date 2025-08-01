import { useRef, useEffect } from 'react';
import { useCarousel } from '../contexts/CarouselContext';
import { projectTitleClasses, projectTitleStyle } from '../utils/sharedStyles';

type ProjectTitleProps = {
  title: string;
  onNextSection: () => void;
  onShowPopup: (projectTitle: string) => void;
  isPopupVisible: boolean;
  isAboutPopupVisible: boolean;
};

export default function ProjectTitle({ title, onNextSection, onShowPopup, isPopupVisible, isAboutPopupVisible }: ProjectTitleProps) {
  const { currentSlide, totalSlides, isScrolling } = useCarousel();
  const actionRef = useRef<'popup' | 'next'>('popup');
  const stableSlideRef = useRef(currentSlide);
  
  // Update refs immediately without debouncing
  useEffect(() => {
    stableSlideRef.current = currentSlide;
    actionRef.current = currentSlide === totalSlides - 1 ? 'next' : 'popup';
  }, [currentSlide, totalSlides]);
  
  const handleTitleClick = () => {
    // Prevent clicks during scrolling
    if (isScrolling) {
      return;
    }
    
    // Use the stable slide value
    const stableSlide = stableSlideRef.current;
    const action = stableSlide === totalSlides - 1 ? 'next' : 'popup';
    console.log('ProjectTitle Clicked - Action:', action, { stableSlide, totalSlides });
    
    if (action === 'next') {
      onNextSection();
    } else {
      onShowPopup(title);
    }
  };

  // Use current slide for immediate text change (faster response)
  const isLastSlide = currentSlide === totalSlides - 1;

  // Calculate visibility once to avoid flickering
  // Also check if carousel is initialized (totalSlides > 0)
  const shouldShowTitle = !isPopupVisible && !isAboutPopupVisible && totalSlides > 0;

  return (
    <>
      {/* Project Title - Positioned relative to section with higher z-index */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-4/5 pointer-events-none"
        style={{ 
          zIndex: 100, // Higher than carousel elements
          transform: 'translate(-50%, -50%)', // Explicit transform for Safari
          WebkitTransform: 'translate(-50%, -50%)', // Safari-specific
        }}
      >
        <div className="pointer-events-auto">
          <h1 
            className={`text-white text-center drop-shadow-2xl px-6 md:px-6 py-3 cursor-pointer ${projectTitleClasses}`}
            style={{
              ...projectTitleStyle,
              opacity: shouldShowTitle ? 1 : 0,
              visibility: shouldShowTitle ? 'visible' : 'hidden', // Prevent layout shifts
              transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
              position: 'relative',
              zIndex: 1,
              // Safari-specific fixes
              WebkitBackfaceVisibility: 'hidden',
              WebkitPerspective: 1000,
              WebkitTransform: 'translateZ(0)', // Force hardware acceleration
            }}
            onClick={handleTitleClick}
          >
            {isLastSlide ? 'NEXT PROJECT' : title}
          </h1>
        </div>
      </div>
    </>
  );
}