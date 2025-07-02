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
};

// --- Reusable Carousel Component ---
export default function SwipeCarousel({ mediaItems, onActiveIndexChange }: SwipeCarouselProps) {
  const { currentSlide, setCurrentSlide, setTotalSlides } = useCarousel();
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Navigation hints state
  const [showHints, setShowHints] = useState(false);
  const [showDownHint, setShowDownHint] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);
  const downHintTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize carousel
  useEffect(() => {
    setTotalSlides(mediaItems.length);
    setCurrentSlide(0);
  }, [mediaItems.length, setTotalSlides, setCurrentSlide]);

  // Notify parent of slide changes
  useEffect(() => {
    onActiveIndexChange?.(currentSlide);
  }, [currentSlide, onActiveIndexChange]);

  // Handle scroll events to update current slide
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const slideWidth = carousel.offsetWidth;
      const newSlideIndex = Math.round(scrollLeft / slideWidth);
      
      if (newSlideIndex !== currentSlide && newSlideIndex >= 0 && newSlideIndex < mediaItems.length) {
        setCurrentSlide(newSlideIndex);
      }
    };

    carousel.addEventListener('scroll', handleScroll, { passive: true });
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, [currentSlide, mediaItems.length, setCurrentSlide]);

  // --- Navigation Hints Logic ---
  useEffect(() => {
    // Only show hints if there are multiple items and user hasn't interacted
    if (mediaItems.length > 1 && !userInteracted) {
      hintTimerRef.current = setTimeout(() => {
        setShowHints(true);
      }, 2000);
    }

    return () => {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
    };
  }, [mediaItems.length, userInteracted]);

  // --- Down Hint Logic for Last Slide ---
  useEffect(() => {
    // Clear any existing timer
    if (downHintTimerRef.current) {
      clearTimeout(downHintTimerRef.current);
      setShowDownHint(false);
    }

    // Show down hint when on last slide - independent of horizontal interactions
    if (currentSlide === mediaItems.length - 1 && mediaItems.length > 1) {
      downHintTimerRef.current = setTimeout(() => {
        setShowDownHint(true);
      }, 2000);
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
      setShowHints(false);
      // Don't hide down hint when user interacts horizontally
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

  return (
    <div className="relative h-full w-full bg-black font-sans" data-carousel="true">
      {/* Modern CSS Scroll-Snap Carousel */}
      <div
        ref={carouselRef}
        className="h-full w-full flex snap-x snap-mandatory overflow-x-auto"
        style={{ 
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE
          overscrollBehaviorX: 'none',
          scrollBehavior: 'smooth'
        }}
        onScroll={hideHints}
      >
        {/* Hide scrollbar for Webkit browsers */}
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {mediaItems.map((item, idx) => (
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
      </div>
      
      {/* Navigation Hints */}
      <AnimatePresence>
        {showHints && mediaItems.length > 1 && (
          <>
            {/* Right Chevron Hint */}
            {currentSlide < mediaItems.length - 1 && (
              <motion.div
                className="absolute right-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 0.7, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div 
                  className="text-white drop-shadow-2xl"
                  dangerouslySetInnerHTML={{ 
                    __html: feather.icons['chevron-right'].toSvg({ 
                      width: 32, 
                      height: 32, 
                      color: 'white' 
                    }) 
                  }} 
                />
              </motion.div>
            )}
            
            {/* Left Chevron Hint */}
            {currentSlide > 0 && (
              <motion.div
                className="absolute left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 0.7, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div 
                  className="text-white drop-shadow-2xl"
                  dangerouslySetInnerHTML={{ 
                    __html: feather.icons['chevron-left'].toSvg({ 
                      width: 32, 
                      height: 32, 
                      color: 'white' 
                    }) 
                  }} 
                />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Down Chevron Hint for Last Slide */}
      <AnimatePresence>
        {showDownHint && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 z-20 cursor-pointer hover:opacity-100"
            style={{ bottom: '20px' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.7, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onClick={scrollToNextSection}
          >
            <div 
              className="text-white drop-shadow-2xl"
              dangerouslySetInnerHTML={{ 
                __html: feather.icons['chevron-down'].toSvg({ 
                  width: 32, 
                  height: 32, 
                  color: 'white' 
                }) 
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {mediaItems.length > 1 && currentSlide > 0 && currentSlide < mediaItems.length - 1 && (
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

    </div>
  );
}

// --- Progress Bar Sub-component ---
type ProgressBarProps = { currentIndex: number; totalItems: number };
const ProgressBar: React.FC<ProgressBarProps> = ({ currentIndex, totalItems }) => {
  // Calculate progress: 0% at first slide, 100% at last slide
  const progressPercentage = totalItems > 1 ? (currentIndex / (totalItems - 1)) * 100 : 0;

  if (totalItems <= 1) return null;

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-4/5">
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
