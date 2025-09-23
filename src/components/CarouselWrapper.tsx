import { useRef } from 'react';
import CSSCarousel from './CSSCarousel';
import CSSProjectTitle from './CSSProjectTitle';
import type { Settings } from '../config/pocketbase';

// --- Type Definitions ---
// Simple image object with just a source URL
type MediaItem = {
  src: string;
};

// Props that the wrapper accepts from parent components
type CarouselWrapperProps = {
  mediaItems: MediaItem[];              // Array of images to display
  projectTitle?: string;                // Title displayed over carousel
  onNextSection?: () => void;           // What happens when "next section" is clicked
  onShowPopup?: (title: string) => void;  // Show project popup
  isPopupVisible?: boolean;             // Is project popup currently visible?
  isAboutPopupVisible?: boolean;        // Is about popup currently visible?
  showTopProgressBar?: boolean;         // Control top progress bar visibility
  settingsData?: Settings | null;       // Settings for dynamic font sizing
};


// --- Carousel Wrapper Component ---
// Wrapper that adds project title overlay to the CSS carousel
export default function CarouselWrapper({ 
  mediaItems, 
  projectTitle,
  onNextSection,
  onShowPopup,
  isPopupVisible = false,
  isAboutPopupVisible = false,
  showTopProgressBar = true,
  settingsData = null
}: CarouselWrapperProps) {
  // Reference to the carousel DOM element (needed for CSSProjectTitle)
  const carouselRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative h-full w-full">
      {/* CSS-native carousel with modern scroll-state features */}
      <CSSCarousel 
        ref={carouselRef}
        mediaItems={mediaItems}
        showTopProgressBar={showTopProgressBar}
      />
      {/* Project title overlay */}
      {projectTitle && (
        <CSSProjectTitle 
          title={projectTitle}
          carouselRef={carouselRef}
          mediaItems={mediaItems}
          onNextSection={onNextSection}
          onShowPopup={onShowPopup}
          isPopupVisible={isPopupVisible}
          isAboutPopupVisible={isAboutPopupVisible}
          settingsData={settingsData}
        />
      )}
    </div>
  );
}