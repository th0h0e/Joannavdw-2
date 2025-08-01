import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import feather from 'feather-icons';
import { useCarousel } from '../contexts/CarouselContext';

// --- Type Definitions ---
type MediaItem = {
  src: string;
};

type SwipeCarouselProps = {
  mediaItems: MediaItem[];
  onActiveIndexChange?: (index: number) => void;
  isFirstCarousel?: boolean;
};

// --- Reusable Carousel Component ---
export default function SwipeCarousel({ mediaItems, onActiveIndexChange }: SwipeCarouselProps) {
  const { currentSlide, setCurrentSlide, setTotalSlides, setIsScrolling } = useCarousel();
  const carouselRef = useRef<HTMLDivElement>(null);
  const backgroundImageRef = useRef<HTMLDivElement>(null);
  const blurSlideRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Navigation hints state
  const [showDownHint, setShowDownHint] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const downHintTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = mediaItems.length + 1; // +1 for blur slide

  // Initialize carousel
  useEffect(() => {
    setTotalSlides(totalSlides);
    setCurrentSlide(0);
  }, [mediaItems.length, setTotalSlides, setCurrentSlide, totalSlides]);

  // Notify parent of slide changes (only for actual media items, not blur slide)
  useEffect(() => {
    if (currentSlide < mediaItems.length) {
      onActiveIndexChange?.(currentSlide);
    }
  }, [currentSlide, onActiveIndexChange, mediaItems.length]);

  // Handle scroll events to update current slide with debouncing
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      // Set scrolling state immediately
      setIsScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Update slide index calculation
      const scrollLeft = carousel.scrollLeft;
      const slideWidth = carousel.offsetWidth;
      const newSlideIndex = Math.round(scrollLeft / slideWidth);
      
      if (newSlideIndex !== currentSlide && newSlideIndex >= 0 && newSlideIndex < totalSlides) {
        setCurrentSlide(newSlideIndex);
      }
      
      // Debounce the end of scrolling with 5ms delay
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 5); // Very short delay for fast response
    };

    carousel.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      carousel.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentSlide, totalSlides, setCurrentSlide, setIsScrolling]);

  // --- Down Hint Logic for Blur Slide ---
  useEffect(() => {
    // Clear any existing timer
    if (downHintTimerRef.current) {
      clearTimeout(downHintTimerRef.current);
      setShowDownHint(false);
    }

    // Show down hint when on blur slide (last slide)
    if (currentSlide === totalSlides - 1 && mediaItems.length > 1) {
      downHintTimerRef.current = setTimeout(() => {
        setShowDownHint(true);
      }, 150);
    }

    return () => {
      if (downHintTimerRef.current) {
        clearTimeout(downHintTimerRef.current);
      }
    };
  }, [currentSlide, mediaItems.length]);

  const hideHints = () => {
    if (!userInteracted) {
      setUserInteracted(true);
    }
  };

  const scrollToNextSection = () => {
    const main = document.querySelector('main');
    if (main) {
      main.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  // --- Render Logic ---
  if (mediaItems.length === 0) {
    return (
      <div className="relative h-full w-full flex items-center justify-center text-white bg-black">
        <p>No images to display.</p>
      </div>
    );
  }

  const lastImage = mediaItems[mediaItems.length - 1];

  return (
    <div className="relative h-full w-full bg-black font-sans" data-carousel="true">
      {/* Background image for last slide - always visible */}
      <div
        ref={backgroundImageRef}
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${lastImage.src})`,
          zIndex: 5,
        }}
      />

      {/* Modern CSS Scroll-Snap Carousel */}
      <div
        ref={carouselRef}
        className="relative h-full w-full flex snap-x snap-mandatory overflow-x-auto"
        style={{ 
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE
          overscrollBehaviorX: 'contain',
          scrollBehavior: 'smooth',
          zIndex: 10,
        }}
        onScroll={hideHints}
      >
        {/* Hide scrollbar for Webkit browsers */}
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* Normal slides (except last one) */}
        {mediaItems.slice(0, -1).map((item, idx) => (
          <div
            key={`${item.src}-${idx}`}
            className="relative h-full w-full flex-shrink-0 bg-black bg-cover bg-center snap-center"
            style={{ 
              backgroundImage: `url(${item.src})`,
              minWidth: '100%'
            }}
            role="group"
            aria-label={`Slide ${idx + 1}`}
          />
        ))}

        {/* Transparent last slide */}
        <div
          className="relative h-full w-full flex-shrink-0 snap-center"
          style={{ 
            minWidth: '100%',
            background: 'transparent',
            zIndex: 15,
          }}
          role="group"
          aria-label={`Slide ${mediaItems.length}`}
        />

        {/* Blur overlay slide */}
        <div
          ref={blurSlideRef}
          className="relative h-full w-full flex-shrink-0 snap-center"
          style={{ 
            minWidth: '100%',
            background: currentSlide === totalSlides - 1 ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
            backdropFilter: currentSlide === totalSlides - 1 ? 'blur(8px)' : 'blur(0px)',
            WebkitBackdropFilter: currentSlide === totalSlides - 1 ? 'blur(8px)' : 'blur(0px)',
            zIndex: 15,
            transition: 'all 0.7s ease-out',
          }}
          role="group"
          aria-label="Blur overlay"
        />
      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {mediaItems.length > 1 && currentSlide > 0 && currentSlide < totalSlides - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ProgressBar currentIndex={currentSlide} totalItems={mediaItems.length} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Down Chevron Hint for Transparent Slide */}
      <AnimatePresence>
        {showDownHint && (
          <motion.div
            className="absolute z-20 cursor-pointer hover:opacity-100 w-6 h-6"
            style={{ bottom: '20px', left: '50%', marginLeft: '-12px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={scrollToNextSection}
          >
            <div 
              className="text-white drop-shadow-2xl w-full h-full"
              dangerouslySetInnerHTML={{ 
                __html: feather.icons['chevron-down'].toSvg({ 
                  width: window.innerWidth >= 768 ? 28 : 24, 
                  height: window.innerWidth >= 768 ? 28 : 24, 
                  color: 'white' 
                }) 
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Progress Bar Sub-component ---
type ProgressBarProps = { currentIndex: number; totalItems: number };
const ProgressBar: React.FC<ProgressBarProps> = ({ currentIndex, totalItems }) => {
  // Calculate progress based on actual media items (excluding blur slide)
  const progressPercentage = totalItems > 1 ? (currentIndex / (totalItems - 1)) * 100 : 0;

  if (totalItems <= 1) return null;

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-full md:w-4/5 px-6 md:px-0">
      <div className="h-0.5 bg-gray-500/50 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          className="h-full bg-gray-50"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};
