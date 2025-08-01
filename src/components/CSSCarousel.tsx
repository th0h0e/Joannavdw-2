import { useRef, useEffect, forwardRef, useState } from 'react';
import { useCarousel } from '../contexts/CarouselContext';
import feather from 'feather-icons';

// --- Type Definitions ---
type MediaItem = {
  src: string;
};

type CSSCarouselProps = {
  mediaItems: MediaItem[];
  onActiveIndexChange?: (index: number) => void;
  isFirstCarousel?: boolean;
};

// --- CSS-Native Carousel Component ---
const CSSCarousel = forwardRef<HTMLDivElement, CSSCarouselProps>(({ 
  mediaItems, 
  onActiveIndexChange, 
  isFirstCarousel = false
}, ref) => {
  const { setCurrentSlide: setContextSlide, setTotalSlides } = useCarousel();
  const internalRef = useRef<HTMLDivElement>(null);
  const carouselRef = (ref && typeof ref === 'object') ? ref : internalRef;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Initialize carousel and set up any necessary JavaScript
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Listen for scroll events for parent notifications and progress tracking
    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const containerWidth = carousel.offsetWidth;
      const isDesktop = window.innerWidth >= 1024;
      
      let currentIndex = 0;
      
      if (isDesktop) {
        // Desktop: Mixed slide widths - calculate based on slide positions
        // Slides 0 to mediaItems.length-1: 50% width
        // Transparent slide (mediaItems.length): 100% width  
        // Blur slide (mediaItems.length+1): 100% width
        
        const halfWidth = containerWidth * 0.5;
        const fullWidth = containerWidth;
        
        // Calculate cumulative positions
        let accumulatedWidth = 0;
        const totalSlides = mediaItems.length + 2;
        
        for (let i = 0; i < totalSlides; i++) {
          const slideWidth = (i >= mediaItems.length) ? fullWidth : halfWidth;
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
      
      // Update current slide state for progress bar
      setCurrentSlide(currentIndex);
      
      // Update carousel context for NavigationHint
      setContextSlide(currentIndex);
      
      // Only report actual media items to parent, not transparent/blur slides
      if (onActiveIndexChange && currentIndex < mediaItems.length) {
        onActiveIndexChange(currentIndex);
      }
    };

    carousel.addEventListener('scroll', handleScroll, { passive: true });
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, [mediaItems.length, onActiveIndexChange, setContextSlide]);

  // Initialize carousel context
  useEffect(() => {
    const totalSlides = mediaItems.length + 2; // +1 for transparent, +1 for blur
    setTotalSlides(totalSlides);
    setContextSlide(0);
  }, [mediaItems.length, setTotalSlides, setContextSlide]);

  // Handle window resize to recalculate slide positions
  useEffect(() => {
    const handleResize = () => {
      const carousel = carouselRef.current;
      if (!carousel) return;
      
      // Use the same logic as handleScroll for consistency
      const scrollLeft = carousel.scrollLeft;
      const containerWidth = carousel.offsetWidth;
      const isDesktop = window.innerWidth >= 1024;
      
      let currentIndex = 0;
      
      if (isDesktop) {
        const halfWidth = containerWidth * 0.5;
        const fullWidth = containerWidth;
        let accumulatedWidth = 0;
        const totalSlides = mediaItems.length + 2;
        
        for (let i = 0; i < totalSlides; i++) {
          const slideWidth = (i >= mediaItems.length) ? fullWidth : halfWidth;
          const slideCenter = accumulatedWidth + (slideWidth / 2);
          
          if (scrollLeft + (containerWidth / 2) <= slideCenter + (slideWidth / 4)) {
            currentIndex = i;
            break;
          }
          
          accumulatedWidth += slideWidth;
        }
      } else {
        const slideWidth = containerWidth;
        currentIndex = Math.round(scrollLeft / slideWidth);
      }
      
      setCurrentSlide(currentIndex);
      setContextSlide(currentIndex);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setContextSlide, mediaItems.length]);

  // Handle next section navigation
  const scrollToNextSection = () => {
    const main = document.querySelector('main');
    if (main) {
      main.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  // Early return for empty carousel
  if (mediaItems.length === 0) {
    return (
      <div className="relative h-full w-full flex items-center justify-center text-white bg-black">
        <p>No images to display.</p>
      </div>
    );
  }

  const lastImage = mediaItems[mediaItems.length - 1];
  
  // Generate CSS classes for this carousel
  const carouselClasses = [
    'css-carousel',
    isFirstCarousel && 'css-carousel--first',
    mediaItems.length > 1 && 'css-carousel--with-progress'
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* CSS Styles - will be moved to CSS file later */}
      <style>{`
        /* Base carousel styles */
        .css-carousel {
          position: relative;
          height: 100%;
          width: 100%;
          background-image: url(${lastImage.src});
          background-size: cover;
          background-position: center;
          font-family: sans-serif;
          
          /* Enable scroll-snap and anchor positioning */
          overflow-x: auto;
          overscroll-behavior-x: contain;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          anchor-name: --css-carousel;
          
          /* Enable scroll-state queries */
          container-type: scroll-state;
          
          /* Hide scrollbars */
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .css-carousel::-webkit-scrollbar {
          display: none;
        }
        
        /* Carousel container */
        .css-carousel__container {
          position: relative;
          height: 100%;
          width: 100%;
          display: flex;
          z-index: 10;
        }
        
        /* Background image for blur effect */
        .css-carousel__background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          z-index: 5;
        }
        
        /* Individual slides */
        .css-carousel__slide {
          position: relative;
          height: 100%;
          width: 100%;
          flex-shrink: 0;
          min-width: 100%;
          scroll-snap-align: center;
          scroll-snap-stop: always;
          
          /* Enable scroll-state queries on each slide */
          container-type: scroll-state;
        }
        
        /* Desktop: Half-width slides */
        @media (min-width: 1024px) {
          .css-carousel__slide {
            min-width: 50%;
            width: 50%;
          }
          
          /* Only blur slide full-width */
          .css-carousel__slide--blur {
            min-width: 100% !important;
            width: 100% !important;
          }
        }
        
        .css-carousel__slide--image {
          background-size: cover;
          background-position: center;
          background-color: black;
        }
        
        .css-carousel__slide--transparent {
          background: transparent;
          z-index: 15;
        }
        
        /* Desktop: Show last image on transparent slide */
        @media (min-width: 1024px) {
          .css-carousel__slide--transparent {
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }
        }
        
        .css-carousel__slide--blur {
          background: transparent;
          z-index: 15;
        }
        
        .css-carousel__slide--blur > .blur-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }
        
        .css-carousel__slide--blur > .blur-overlay > .black-blur-div {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(0px);
          -webkit-backdrop-filter: blur(0px);
          transition: all 0.15s ease-out;
        }
        
        .css-carousel__slide--blur > .blur-overlay {
          @container scroll-state(snapped: x) {
            > .black-blur-div {
              background: rgba(0, 0, 0, 0.3);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              transition: all 1.2s ease-out 0.3s;
            }
          }
        }
        
        /* Desktop: Remove fade effect, show blur immediately */
        @media (min-width: 1024px) {
          .css-carousel__slide--blur > .blur-overlay > .black-blur-div {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            transition: none;
          }
          
          .css-carousel__slide--blur > .blur-overlay {
            @container scroll-state(snapped: x) {
              > .black-blur-div {
                transition: none;
              }
            }
          }
        }
        
        /* Navigation buttons using ::scroll-button() */
        .css-carousel--first::scroll-button(right) {
          content: '' / 'Next slide';
          position: fixed;
          position-anchor: --css-carousel;
          position-area: inline-end center;
          
          background: red; /* Temporary: make it visible for debugging */
          border: 2px solid yellow; /* Temporary: debugging border */
          width: 50px; /* Temporary: larger for visibility */
          height: 50px; /* Temporary: larger for visibility */
          cursor: pointer;
          
          /* Add chevron-right icon using pseudo-element content */
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9,18 15,12 9,6'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
          
          filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.5));
          
          opacity: 1;
          transition: opacity 0.15s ease;
          z-index: 100;
        }
        
        /* Fallback for browsers without scroll-button support */
        @supports not (selector(::scroll-button(right))) {
          .css-carousel--first::after {
            content: '→';
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            
            background: red;
            border: 2px solid yellow;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            color: white;
            font-size: 24px;
            cursor: pointer;
            z-index: 100;
          }
        }
        
        /* Progress markers using ::scroll-marker() - COMMENTED OUT */
        /*
        .css-carousel--with-progress {
          scroll-marker-group: after;
        }
        
        .css-carousel--with-progress::scroll-marker-group {
          position: fixed;
          position-anchor: --css-carousel;
          position-area: block-end;
          margin: 20px;
          
          display: flex;
          gap: 8px;
          justify-content: center;
          z-index: 30;
        }
        
        .css-carousel__slide::scroll-marker {
          content: '';
          width: 40px;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
          transition: background 0.3s ease;
          border-radius: 1px;
        }
        
        .css-carousel__slide::scroll-marker:target-current {
          background: white;
        }
        */
        
        /* Scroll-state queries for component communication */
        
        /* Chevron is now always visible - no conditional logic needed */
        
        /* Blur slide activation when snapped - moved to child element */
        
        /* Down hint for blur slide */
        .css-carousel__slide--blur::scroll-button(down) {
          content: '↓' / 'Next section';
          position: fixed;
          position-anchor: --css-carousel;
          position-area: block-end;
          margin: 20px;
          
          background: none;
          border: none;
          color: white;
          font-size: 28px;
          cursor: pointer;
          
          opacity: 0;
          transition: opacity 0.15s ease;
          z-index: 30;
        }
        
        .css-carousel__slide--blur {
          @container scroll-state(snapped: x) {
            &::scroll-button(down) {
              opacity: 1;
            }
          }
        }
        
        /* Feature detection fallback */
        @supports not (container-type: scroll-state) {
          .css-carousel--fallback-notice {
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 4px;
            z-index: 1000;
            font-size: 12px;
          }
        }
        
        @supports not (scroll-marker-group: after) {
          .css-carousel--with-progress::scroll-marker-group {
            display: none;
          }
        }
        
        /* Progress bar fade animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>

      <div className={carouselClasses} ref={(el) => {
        if (carouselRef && 'current' in carouselRef) {
          carouselRef.current = el;
        }
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref && 'current' in ref) {
          ref.current = el;
        }
      }} data-carousel="css-native">
        {/* Background image for blur effect */}
        <div
          className="css-carousel__background"
          style={{
            backgroundImage: `url(${lastImage.src})`,
          }}
        />

        {/* Carousel container */}
        <div className="css-carousel__container">
          {/* Regular image slides (all except last) */}
          {mediaItems.slice(0, -1).map((item, idx) => (
            <div
              key={`${item.src}-${idx}`}
              className="css-carousel__slide css-carousel__slide--image"
              style={{ 
                backgroundImage: `url(${item.src})`,
              }}
              role="group"
              aria-label={`Slide ${idx + 1}`}
              data-label={`Slide ${idx + 1}`}
            />
          ))}

          {/* Transparent slide (shows background) */}
          <div
            className="css-carousel__slide css-carousel__slide--transparent"
            role="group"
            aria-label={`Slide ${mediaItems.length}`}
            data-label={`Slide ${mediaItems.length}`}
            style={{
              backgroundImage: `url(${lastImage.src})`
            }}
          />

          {/* Blur overlay slide */}
          <div
            className="css-carousel__slide css-carousel__slide--blur"
            role="group"
            aria-label="Next section"
            data-label="Next"
            onClick={scrollToNextSection}
            style={{ cursor: 'pointer' }}
          >
            <div className="blur-overlay">
              <div className="black-blur-div" />
              {/* Down Chevron inside blur overlay */}
              <div
                className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 cursor-pointer hover:opacity-70 transition-opacity duration-300 pointer-events-auto"
              >
                <div 
                  className="text-white drop-shadow-2xl w-6 h-6"
                  dangerouslySetInnerHTML={{ 
                    __html: feather.icons['chevron-down'].toSvg({ 
                      width: window.innerWidth >= 768 ? 28 : 24, 
                      height: window.innerWidth >= 768 ? 28 : 24, 
                      color: 'white' 
                    }) 
                  }} 
                />
              </div>
            </div>
          </div>
        </div>


        {/* Feature detection notice (only shows if CSS features not supported) */}
        <div className="css-carousel--fallback-notice">
          CSS Carousel (Fallback to React if unsupported)
        </div>

      </div>

      {/* JavaScript Progress Bar Fallback - Outside carousel container */}
      {mediaItems.length > 1 && currentSlide > 0 && currentSlide < mediaItems.length && (
        <div 
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-full md:w-4/5 px-6 md:px-0"
          style={{
            animation: 'fadeIn 0.15s ease-in-out'
          }}
        >
          <div className="h-0.5 bg-gray-500/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gray-50 transition-all duration-500 ease-in-out"
              style={{
                width: `${mediaItems.length > 1 ? (currentSlide / (mediaItems.length - 1)) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      )}

    </>
  );
});

CSSCarousel.displayName = 'CSSCarousel';

export default CSSCarousel;