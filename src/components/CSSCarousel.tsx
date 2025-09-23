import { useRef, useEffect, forwardRef, useState } from 'react';
import { useCarousel } from '../contexts/CarouselContext';
import ChevronDown from './icons/ChevronDown';
import ChevronRight from './icons/ChevronRight';

// --- Type Definitions ---
// Simple image object with just a source URL
type MediaItem = {
  src: string;
};

// Props this carousel component accepts
type CSSCarouselProps = {
  mediaItems: MediaItem[];              // Array of images to display
  onActiveIndexChange?: (index: number) => void;  // Callback when slide changes
  showTopProgressBar?: boolean;         // Control top progress bar visibility
};

// --- CSS-Native Carousel Component ---
// This carousel uses cutting-edge CSS features instead of JavaScript for scrolling
const CSSCarousel = forwardRef<HTMLDivElement, CSSCarouselProps>(({ 
  mediaItems, 
  onActiveIndexChange,
  showTopProgressBar = true
}, ref) => {
  // Connect to the global carousel context (used by other components)
  const { setCurrentSlide: setContextSlide, setTotalSlides, isSafari, supportsScrollState } = useCarousel();
  
  // Ref handling: support both forwarded refs and internal refs
  const internalRef = useRef<HTMLDivElement>(null);
  const carouselRef = (ref && typeof ref === 'object') ? ref : internalRef;
  
  // Track which slide is currently active (for progress bar and chevron visibility)
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Track if we're on the blur slide (for Safari fallback)
  const [isOnBlurSlide, setIsOnBlurSlide] = useState(false);
  
  
  // CSS Variables reader - allows JS to access CSS scroll-state information
  const [, setCssScrollState] = useState({
    isScrollableRight: false,
    isScrollableLeft: false,
    transparentSlideActive: false,
    blurSlideActive: false
  });

  // Browser detection passed from parent (detected in HTML head)

  // Set up JavaScript listeners (even though most logic is CSS-native)
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Listen for scroll events to track which slide is currently active
    // This is needed for: progress bar, chevron visibility, and parent callbacks
    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const containerWidth = carousel.offsetWidth;
      const isDesktop = window.innerWidth >= 1024;
      
      let currentIndex = 0;
      
      if (isDesktop) {
        // DESKTOP: Mixed slide widths require complex position calculation
        // Regular slides: 50% width, Transparent slide: 50% width, Blur slide: 100% width
        
        const halfWidth = containerWidth * 0.5;
        const fullWidth = containerWidth;
        
        // Walk through each slide and calculate its position
        let accumulatedWidth = 0;
        const totalSlides = mediaItems.length + 2; // +1 transparent, +1 blur
        
        for (let i = 0; i < totalSlides; i++) {
          // Determine this slide's width (blur slide is full width, others are half)
          const slideWidth = (i >= mediaItems.length) ? fullWidth : halfWidth;
          const slideCenter = accumulatedWidth + (slideWidth / 2);
          
          // Check if the current scroll position shows this slide as active
          if (scrollLeft + (containerWidth / 2) <= slideCenter + (slideWidth / 4)) {
            currentIndex = i;
            break;
          }
          
          accumulatedWidth += slideWidth;
        }
      } else {
        // MOBILE/TABLET: Simple slide detection based on scroll position
        const totalSlides = mediaItems.length + 2; // +1 transparent, +1 blur
        const maxScroll = carousel.scrollWidth - containerWidth;
        const scrollPercentage = scrollLeft / maxScroll;
        
        // Map scroll percentage to slide index
        currentIndex = Math.round(scrollPercentage * (totalSlides - 1));
        currentIndex = Math.max(0, Math.min(currentIndex, totalSlides - 1));
      }
      
      // Update internal state (used for progress bar and chevron visibility)
      setCurrentSlide(currentIndex);
      
      // Check if we're on the blur slide (for Safari fallback)
      const totalSlidesCount = mediaItems.length + 2; // +1 transparent, +1 blur
      const isBlurSlide = currentIndex === totalSlidesCount - 1;
      setIsOnBlurSlide(isBlurSlide);
      
      // Update global carousel context (used by other components)
      setContextSlide(currentIndex);
      
      // Notify parent component, but only for actual image slides (not transparent/blur)
      if (onActiveIndexChange && currentIndex < mediaItems.length) {
        onActiveIndexChange(currentIndex);
      }
    };

    carousel.addEventListener('scroll', handleScroll, { passive: true });
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, [mediaItems.length, onActiveIndexChange, setContextSlide]);

  // Read CSS variables to sync CSS scroll-state with JavaScript (Skip on Safari)
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || isSafari) return; // Skip CSS variable reading on Safari

    const readCssVariables = () => {
      const computedStyle = getComputedStyle(carousel);
      
      const newState = {
        isScrollableRight: computedStyle.getPropertyValue('--is-scrollable-right').trim() === '1',
        isScrollableLeft: computedStyle.getPropertyValue('--is-scrollable-left').trim() === '1',
        transparentSlideActive: computedStyle.getPropertyValue('--transparent-slide-is-active').trim() === '1',
        blurSlideActive: computedStyle.getPropertyValue('--blur-slide-is-active').trim() === '1'
      };
      
      setCssScrollState(newState);
    };

    // Read on scroll and resize
    carousel.addEventListener('scroll', readCssVariables, { passive: true });
    window.addEventListener('resize', readCssVariables);
    
    // Initial read
    readCssVariables();

    return () => {
      carousel.removeEventListener('scroll', readCssVariables);
      window.removeEventListener('resize', readCssVariables);
    };
  }, [isSafari, supportsScrollState, currentSlide, mediaItems.length]);

  // Set up the global carousel context when component mounts
  useEffect(() => {
    const totalSlides = mediaItems.length + 2; // +1 for transparent, +1 for blur
    setTotalSlides(totalSlides);
    setContextSlide(0); // Start at first slide
  }, [mediaItems.length, setTotalSlides, setContextSlide]);

  // Handle window resizing (desktop ↔ mobile changes slide width calculations)
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
        // MOBILE/TABLET: Simple slide detection based on scroll position
        const totalSlides = mediaItems.length + 2; // +1 transparent, +1 blur
        const maxScroll = carousel.scrollWidth - containerWidth;
        const scrollPercentage = scrollLeft / maxScroll;
        
        // Map scroll percentage to slide index
        currentIndex = Math.round(scrollPercentage * (totalSlides - 1));
        currentIndex = Math.max(0, Math.min(currentIndex, totalSlides - 1));
      }
      
      setCurrentSlide(currentIndex);
      
      // Check if we're on the blur slide (for Safari fallback)
      const totalSlidesCount = mediaItems.length + 2; // +1 transparent, +1 blur
      const isBlurSlide = currentIndex === totalSlidesCount - 1;
      setIsOnBlurSlide(isBlurSlide);
      
      setContextSlide(currentIndex);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setContextSlide, mediaItems.length]);


  // Click handler for the blur slide - scrolls to next section of the website
  const scrollToNextSection = () => {
    const main = document.querySelector('main');
    if (main) {
      main.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };


  // Get the last image for use as background and transparent slide
  const lastImage = mediaItems[mediaItems.length - 1];
  
  // Build CSS class list based on carousel features
  const carouselClasses = [
    'css-carousel',                                           // Base carousel styles
    mediaItems.length > 1 && 'css-carousel--with-progress'   // Multiple images get progress bar
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* 
        INLINE CSS STYLES - EXPERIMENTAL
        These styles use cutting-edge CSS features that aren't widely supported yet.
        They will be moved to a separate CSS file once the features become stable.
      */}
      <style>{`
        /* 
          BASE CAROUSEL CONTAINER
          Uses CSS scroll-snap for native scrolling behavior
        */
        .css-carousel {
          position: relative;
          height: 100%;
          width: 100%;
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
          
          /* Default: slide is not active */
          --slide-is-active: 0;
          --slide-is-transparent: 0;
          --slide-is-blur: 0;
        }
        
        /* CSS Variables: Communicate scroll-state to parent elements */
        .css-carousel {
          /* Default carousel state variables */
          --current-slide-is-active: 0;
          --transparent-slide-is-active: 0;
          --blur-slide-is-active: 0;
          --is-scrollable-right: 0;
          --is-scrollable-left: 0;
        }
        
        /* Update carousel variables when scrollable states change */
        .css-carousel {
          @container scroll-state(scrollable: right) {
            --is-scrollable-right: 1;
          }
          
          @container scroll-state(scrollable: left) {
            --is-scrollable-left: 1;
          }
        }
        
        /* Desktop: Half-width slides */
        @media (min-width: 1024px) {
          .css-carousel__slide {
            min-width: 50vw;
            width: 50vw;
          }
          
          /* Only blur slide full-width */
          .css-carousel__slide--blur {
            min-width: 100vw !important;
            width: 100vw !important;
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
          
          /* Update parent carousel variables when this slide is active */
          @container scroll-state(snapped: x) {
            --slide-is-active: 1;
            --slide-is-transparent: 1;
          }
        }
        
        /* Pass transparent slide state to carousel */
        .css-carousel:has(.css-carousel__slide--transparent[--slide-is-active="1"]) {
          --transparent-slide-is-active: 1;
        }
        
        /* Mobile/Tablet: Make transparent slide completely transparent */
        @media (max-width: 1023px) {
          .css-carousel__slide--transparent {
            opacity: 0;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }
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
          
          /* Update parent carousel variables when this slide is active */
          @container scroll-state(snapped: x) {
            --slide-is-active: 1;
            --slide-is-blur: 1;
          }
        }
        
        /* Pass blur slide state to carousel */
        .css-carousel:has(.css-carousel__slide--blur[--slide-is-active="1"]) {
          --blur-slide-is-active: 1;
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
          z-index: 1;
        }
        
        /* Mobile/Tablet fallback: Apply blur effect via JavaScript state for all browsers below 1024px */
        .css-carousel__slide--blur > .blur-overlay > .black-blur-div.mobile-blur-active {
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.5s ease-out 0.1s;
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
        
        /* CSS Chevron Right Button with scroll-state queries */
        .css-carousel::scroll-button(right) {
          content: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9,18 15,12 9,6'/%3E%3C/svg%3E") / 'Next slide';
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          
          background: none;
          border: none;
          cursor: pointer;
          
          opacity: 0;
          transition: opacity 0.15s ease-in-out;
          z-index: 30;
        }
        
        /* Safari CSS Chevron Right Button - Uses native scroll behavior */
        .css-carousel__safari-chevron-right {
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          
          background: none;
          border: none;
          cursor: pointer;
          
          opacity: 0;
          transition: opacity 0.15s ease-in-out;
          z-index: 30;
          
          /* Use CSS scroll behavior instead of JavaScript */
          scroll-behavior: smooth;
        }
        
        .css-carousel__safari-chevron-right:hover {
          opacity: 0.7;
        }
        
        /* Show chevron when scrollable to right, hide on transparent/blur slides */
        @media (min-width: 1024px) {
          @supports (container-type: scroll-state) {
            .css-carousel {
              @container scroll-state(scrollable: right) {
                &::scroll-button(right) {
                  opacity: 1;
                }
              }
            }
            
            /* Hide chevron when transparent slide is snapped */
            .css-carousel__slide--transparent {
              @container scroll-state(snapped: x) {
                + * {
                  .css-carousel::scroll-button(right) {
                    opacity: 0 !important;
                  }
                }
              }
            }
            
            /* Hide chevron when blur slide is snapped */
            .css-carousel__slide--blur {
              @container scroll-state(snapped: x) {
                .css-carousel::scroll-button(right) {
                  opacity: 0 !important;
                }
              }
            }
          }
        }
        
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
      }} data-carousel="css-native" style={{
        backgroundImage: `url(${lastImage.src})`
      }}>
        {/* Background image for blur effect */}
        <div
          className="css-carousel__background"
          style={{
            backgroundImage: `url(${lastImage.src})`,
          }}
        />

        {/* 
          CAROUSEL SLIDES CONTAINER
          Contains all the individual slides in a horizontal flex layout
        */}
        <div className="css-carousel__container">
          {/* 
            REGULAR IMAGE SLIDES
            Shows all images except the last one (which is used for transparent slide)
          */}
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

          {/* 
            TRANSPARENT SLIDE 
            Shows the last image on desktop, fully transparent on mobile/tablet
            This creates a smooth transition before the blur effect
          */}
          <div
            className="css-carousel__slide css-carousel__slide--transparent"
            role="group"
            aria-label={`Slide ${mediaItems.length}`}
            data-label={`Slide ${mediaItems.length}`}
            style={{
              backgroundImage: `url(${lastImage.src})`
            }}
          />

          {/* 
            BLUR SLIDE 
            Final slide with blur effect that leads to next section
            Clicking it scrolls to the next section of the website
          */}
          <div
            className="css-carousel__slide css-carousel__slide--blur"
            role="group"
            aria-label="Next section"
            data-label="Next"
            onClick={scrollToNextSection}
            style={{ cursor: 'pointer' }}
          >
            <div className="blur-overlay">
              <div className={`black-blur-div ${window.innerWidth < 1024 && isOnBlurSlide ? 'mobile-blur-active' : ''}`}>
                {/* Down Chevron - inside blur effect layer */}
                <div
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[100] cursor-pointer hover:opacity-70 transition-opacity duration-300 pointer-events-auto"
                >
                  <ChevronDown 
                    width={window.innerWidth >= 768 ? 28 : 24}
                    height={window.innerWidth >= 768 ? 28 : 24}
                    color="white"
                    className="drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>



      </div>

      {/* 
        PROGRESS BAR (BOTTOM)
        Shows carousel progress as a horizontal line at the bottom
        Desktop: Only visible on slides 1 through last image slide (not on first, transparent, or blur slides)
        Mobile/Tablet: Also visible on transparent slide to prevent progress bar jumping
        Uses strictly JavaScript currentSlide detection for all browsers
      */}
      {mediaItems.length > 1 && currentSlide > 0 && (
        // Desktop: Hide on transparent slide (currentSlide < mediaItems.length)
        // Mobile/Tablet: Show on transparent slide (currentSlide <= mediaItems.length)
        (window.innerWidth >= 1024 ? currentSlide < mediaItems.length : currentSlide <= mediaItems.length)
      ) && currentSlide < mediaItems.length + 2 && (
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
                width: `${mediaItems.length > 1 ? (currentSlide / (
                  window.innerWidth >= 1024 ? mediaItems.length - 1 : mediaItems.length
                )) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      )}

      {/* 
        PROGRESS BAR (TOP) - Mobile/Tablet Only
        Shows carousel progress as a horizontal line at the top
        Only visible on devices below 1024px and when showTopProgressBar is true
        Mobile/Tablet: Also visible on transparent slide to prevent progress bar jumping
      */}
      {showTopProgressBar && mediaItems.length > 1 && currentSlide > 0 && currentSlide <= mediaItems.length && (
        <div 
          className="absolute top-5 left-1/2 -translate-x-1/2 z-20 w-full px-6 lg:hidden"
          style={{
            animation: 'fadeIn 0.15s ease-in-out'
          }}
        >
          <div className="h-0.5 bg-gray-500/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gray-50 transition-all duration-500 ease-in-out"
              style={{
                width: `${mediaItems.length > 1 ? (currentSlide / mediaItems.length) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Safari CSS Chevron Right Button - JavaScript visibility, CSS scrolling - Desktop only */}
      {isSafari && window.innerWidth >= 1024 && mediaItems.length > 1 && currentSlide < mediaItems.length - 1 && (
        <button 
          className="css-carousel__safari-chevron-right"
          style={{ opacity: 1 }}
          aria-label="Next slide"
          onClick={(e) => {
            e.preventDefault();
            const carousel = carouselRef.current;
            if (!carousel) return;
            
            // Get the next slide element and scroll to it using CSS scroll-snap
            const slides = carousel.querySelectorAll('.css-carousel__slide');
            const nextSlide = slides[currentSlide + 1];
            if (nextSlide) {
              nextSlide.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest', 
                inline: 'center' 
              });
            }
          }}
        >
          <ChevronRight 
            width={28}
            height={28}
            color="white"
            className="drop-shadow-2xl pointer-events-none"
          />
        </button>
      )}

      {/* CSS chevron button handled above in ::scroll-button() for non-Safari browsers */}

    </>
  );
});

CSSCarousel.displayName = 'CSSCarousel';

export default CSSCarousel;