import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import feather from 'feather-icons';
import SwipeCarousel from './components/SwipeCarousel';
import CarouselWrapper from './components/CarouselWrapper';
import CSSCarousel from './components/CSSCarousel';
import ProjectIndex from './components/ProjectIndex';
import ProjectTitle from './components/ProjectTitle';

// Preload ProjectTitle component
const preloadProjectTitle = () => import('./components/ProjectTitle');
preloadProjectTitle();
import ProjectPopup from './components/ProjectPopup';
import AboutPopup from './components/AboutPopup';
import Hero from './components/Hero';
import LogoTop from './components/LogoTop';
import LogoBottom from './components/LogoBottom';
import HamburgerMenu from './components/HamburgerMenu';
import { CarouselProvider, useCarousel } from './contexts/CarouselContext';

// --- Testing Configuration ---
const USE_CSS_CAROUSEL = false; // Set to true to test CSS Carousel, false for React Carousel

// --- Import Hero Image ---
import heroImage from './assets/Hero Image/Maria Bodil for Nike New Tech Fleece campaign copy.webp';

// --- Import Project Images ---

// Joost Termeer x The F Vintage
import joostTermeer1 from './assets/Image Assets/Joost Termeer x The F Vintage/Joost Termeer work for his own The F Vintage.webp';
import joostTermeer2 from './assets/Image Assets/Joost Termeer x The F Vintage/Joost Termeer work for his own The F Vintage 2.webp';
import joostTermeer3 from './assets/Image Assets/Joost Termeer x The F Vintage/Joost Termeer work for his own The F Vintage 3.webp';

// Maria Bodil for Maedenofficial
import mariaMaeden1 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial.webp';
import mariaMaeden2 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial 2.webp';
import mariaMaeden3 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial 3.webp';
import mariaMaeden4 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial 4.webp';
import mariaMaeden5 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial 5.webp';
import mariaMaeden6 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial 6.webp';
import mariaMaeden7 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial 7.webp';

// Maria Bodil for Nike
import mariaNike1 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign.webp';
import mariaNike2 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign 2.webp';
import mariaNike3 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign 3.webp';
import mariaNike4 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign 4.webp';
import mariaNike5 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign 5.webp';
import mariaNike6 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign 6.webp';
import mariaNike7 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign 7.webp';

// Maria Bodil for Smart
import mariaSmart1 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil for Smart.webp';
import mariaSmart2 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil for Smart 2.webp';
import mariaSmart3 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil for Smart 3.webp';
import mariaSmart4 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil, celebrating 25 years of SMART.webp';
import mariaSmart5 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil, celebrating 25 years of SMART 2.webp';
import mariaSmart6 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil, celebrating 25 years of SMART 3.webp';

// --- CSS Carousel Test Images (Maria Bodil for Smart) ---
import testSmart1 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil for Smart.webp';
import testSmart2 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil for Smart 2.webp';
import testSmart3 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil for Smart 3.webp';
import testSmart4 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil, celebrating 25 years of SMART.webp';
import testSmart5 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil, celebrating 25 years of SMART 2.webp';
import testSmart6 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil, celebrating 25 years of SMART 3.webp';

// Maria Bodil for Vogue Netherlands
import mariaVogue1 from './assets/Image Assets/Maria Bodil for Vogue Netherlands/Maria Bodil for Vogue Netherlands. Production by Spark Productions.webp';
import mariaVogue2 from './assets/Image Assets/Maria Bodil for Vogue Netherlands/Maria Bodil for Vogue Netherlands. Production by Spark Productions 2.webp';
import mariaVogue3 from './assets/Image Assets/Maria Bodil for Vogue Netherlands/Maria Bodil for Vogue Netherlands. Production by Spark Productions 3.webp';

// Sander Coers - Personal Work
import sanderPersonal1 from './assets/Image Assets/Sander Coers - Personal Work/New work by Sander Coers- POST.webp';
import sanderPersonal2 from './assets/Image Assets/Sander Coers - Personal Work/New work by Sander Coers- POST 2.webp';
import sanderPersonal3 from './assets/Image Assets/Sander Coers - Personal Work/New work by Sander Coers- POST 3.webp';
import sanderPersonal4 from './assets/Image Assets/Sander Coers - Personal Work/New work by Sander Coers- POST 4.webp';
import sanderPersonal5 from './assets/Image Assets/Sander Coers - Personal Work/New work by Sander Coers- POST 5.webp';

// Sander Coers for Essentiel Antwerp
import sanderEssentiel1 from './assets/Image Assets/Sander Coers for Essentiel Antwerp/Sander Coers for Essentiel Antwerp.webp';
import sanderEssentiel2 from './assets/Image Assets/Sander Coers for Essentiel Antwerp/Sander Coers for Essentiel Antwerp 2.webp';
import sanderEssentiel3 from './assets/Image Assets/Sander Coers for Essentiel Antwerp/Sander Coers for Essentiel Antwerp 3.webp';
import sanderEssentiel4 from './assets/Image Assets/Sander Coers for Essentiel Antwerp/Sander Coers for Essentiel Antwerp.  @Sandercoers @essentielantwerp.webp';
import sanderEssentiel5 from './assets/Image Assets/Sander Coers for Essentiel Antwerp/Sander Coers for Essentiel Antwerp.  @Sandercoers @essentielantwerp -  - 2025-05-02 13-48-42.webp';
import sanderEssentiel6 from './assets/Image Assets/Sander Coers for Essentiel Antwerp/Sander Coers for Essentiel Antwerp.  @Sandercoers @essentielantwerp -  - 2025-05-02 13-48-47.webp';


// Sander Coers for Sine & Cosine
import sanderSine1 from './assets/Image Assets/Sander Coers for Sine & Cosine/Sine Cosine Photo by @sandercoers.webp';
import sanderSine2 from './assets/Image Assets/Sander Coers for Sine & Cosine/Sine Cosine Photo by @sandercoers.jpg 2.webp';
import sanderSine3 from './assets/Image Assets/Sander Coers for Sine & Cosine/Sine Cosine Photo by @sandercoers.jpg 3.webp';

// Set design images Joost Termeer
import setDesign1 from './assets/Image Assets/Set design images Joost Termeer/Here are the first set design images shot by Joost Termeer together with @studionicklankveld & @melissavanheijst.leather.webp';
import setDesign2 from './assets/Image Assets/Set design images Joost Termeer/Here are the first set design images shot by Joost Termeer together with @studionicklankveld & @melissavanheijst.leather 2.webp';
import setDesign3 from './assets/Image Assets/Set design images Joost Termeer/Here are the first set design images shot by Joost Termeer together with @studionicklankveld & @melissavanheijst.leather 3.webp';

// Suus Waijers for PRADA
import suusPrada1 from './assets/Image Assets/Suus Waijers for PRADA/Suus Waijers for PRADA via Underpromise.webp';
import suusPrada2 from './assets/Image Assets/Suus Waijers for PRADA/Suus Waijers for PRADA via Underpromise 2.webp';
import suusPrada3 from './assets/Image Assets/Suus Waijers for PRADA/Suus Waijers for PRADA via Underpromise 3.webp';

// Navigation Hint Component
function NavigationHint() {
  const { currentSlide } = useCarousel();
  
  // Only show on first slide
  if (currentSlide !== 0) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        className="absolute right-8 top-1/2 z-20 pointer-events-none hidden md:block"
        style={{ 
          transform: 'translateY(-50%)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <div 
          className="text-white drop-shadow-2xl"
          dangerouslySetInnerHTML={{ 
            __html: feather.icons['chevron-right'].toSvg({ 
              width: window.innerWidth >= 768 ? 28 : 24, 
              height: window.innerWidth >= 768 ? 28 : 24, 
              color: 'white' 
            }) 
          }} 
        />
      </motion.div>
    </AnimatePresence>
  );
}

// --- Project Data Arrays ---

const joostTermeerImages = [
  { src: joostTermeer1 },
  { src: joostTermeer2 },
  { src: joostTermeer3 },
];

const mariaMaedenImages = [
  { src: mariaMaeden1 },
  { src: mariaMaeden2 },
  { src: mariaMaeden3 },
  { src: mariaMaeden4 },
  { src: mariaMaeden5 },
  { src: mariaMaeden6 },
  { src: mariaMaeden7 },
];

const mariaNikeImages = [
  { src: mariaNike1 },
  { src: mariaNike2 },
  { src: mariaNike3 },
  { src: mariaNike4 },
  { src: mariaNike5 },
  { src: mariaNike6 },
  { src: mariaNike7 },
];

const mariaSmartImages = [
  { src: mariaSmart1 },
  { src: mariaSmart2 },
  { src: mariaSmart3 },
  { src: mariaSmart4 },
  { src: mariaSmart5 },
  { src: mariaSmart6 },
];

const mariaVogueImages = [
  { src: mariaVogue1 },
  { src: mariaVogue2 },
  { src: mariaVogue3 },
];

const sanderPersonalImages = [
  { src: sanderPersonal1 },
  { src: sanderPersonal2 },
  { src: sanderPersonal3 },
  { src: sanderPersonal4 },
  { src: sanderPersonal5 },
];

const sanderEssentielImages = [
  { src: sanderEssentiel1 },
  { src: sanderEssentiel2 },
  { src: sanderEssentiel3 },
  { src: sanderEssentiel4 },
  { src: sanderEssentiel5 },
  { src: sanderEssentiel6 },
];


const sanderSineImages = [
  { src: sanderSine1 },
  { src: sanderSine2 },
  { src: sanderSine3 },
];

const setDesignImages = [
  { src: setDesign1 },
  { src: setDesign2 },
  { src: setDesign3 },
];

const suusPradaImages = [
  { src: suusPrada1 },
  { src: suusPrada2 },
  { src: suusPrada3 },
];

// --- CSS Carousel Test Images (Maria Bodil for Smart) ---
const testSmartImages = [
  { src: testSmart1 },
  { src: testSmart2 },
  { src: testSmart3 },
  { src: testSmart4 },
  { src: testSmart5 },
  { src: mariaNike1 }, // Replaced black image with Nike image
];

// --- Project Description Text ---
const projectDescription = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet. Pellentesque commodo lacus at sodales sodales. Quisque sagittis orci ut diam condimentum, vel euismod erat placerat. In iaculis arcu eros, eget tempus orci facilisis id.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.";

// --- Project Data Array ---
const projectsData = [
  { title: "Joost Termeer x The F Vintage", description: projectDescription, images: joostTermeerImages },
  { title: "Maria Bodil for Maedenofficial", description: projectDescription, images: mariaMaedenImages },
  { title: "Maria Bodil for Nike", description: projectDescription, images: mariaNikeImages },
  { title: "Maria Bodil for Smart", description: projectDescription, images: mariaSmartImages },
  { title: "Maria Bodil for Vogue Netherlands", description: projectDescription, images: mariaVogueImages },
  { title: "Sander Coers - Personal Work", description: projectDescription, images: sanderPersonalImages },
  { title: "Sander Coers for Essentiel Antwerp", description: projectDescription, images: sanderEssentielImages },
  { title: "Sander Coers for Sine & Cosine", description: projectDescription, images: sanderSineImages },
  { title: "Set design images Joost Termeer", description: projectDescription, images: setDesignImages },
  { title: "Suus Waijers for PRADA", description: projectDescription, images: suusPradaImages }
];

// --- Project Titles Array ---
const projectTitles = projectsData.map(project => project.title);


function App() {
  // State for tracking current section and slide
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  // const [sectionActiveIndices, setSectionActiveIndices] = useState<{[key: number]: number}>({});
  
  // State for popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupProjectTitle, setPopupProjectTitle] = useState('');
  const [popupProjectDescription, setPopupProjectDescription] = useState('');

  // State for about popup
  const [showAboutPopup, setShowAboutPopup] = useState(false);
  const [canOpenAboutPopup, setCanOpenAboutPopup] = useState(true);

  // Removed showHints state - will use carousel's currentSlide instead

  // State for responsive behavior
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Track window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track which section is currently visible using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          // Only update if the section is intersecting and more than 50% visible
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const sectionId = entry.target.id;
            
            // Determine the section index based on the ID
            let index;
            if (sectionId === 'hero-section') {
              index = 0;
            } else if (sectionId === 'css-carousel-test') {
              index = 1;
            } else if (sectionId.startsWith('project-')) {
              // Extract project index and add 2 to account for hero section + test section
              index = parseInt(sectionId.replace('project-', '')) + 2;
            } else if (sectionId === 'project-index') {
              index = projectsData.length + 2;
            }
            
            if (index !== undefined) {
              setCurrentSectionIndex(index);
            }
          }
        });
      },
      { 
        threshold: 0.5, // Trigger when 50% of the section is visible
        root: document.querySelector('main') // Observe within the main scrollable container
      }
    );

    // Observe all sections
    const heroSection = document.getElementById('hero-section');
    if (heroSection) observer.observe(heroSection);
    
    const testSection = document.getElementById('css-carousel-test');
    if (testSection) observer.observe(testSection);
    
    projectsData.forEach((_, index) => {
      const section = document.getElementById(`project-${index}`);
      if (section) observer.observe(section);
    });
    
    const indexSection = document.getElementById('project-index');
    if (indexSection) observer.observe(indexSection);

    return () => observer.disconnect();
  }, [projectsData.length]);

  // Removed old hint management - now handled by carousel's currentSlide

  // const handleActiveIndexChange = (sectionIndex: number) => (activeIndex: number) => {
  //   setSectionActiveIndices(prev => ({
  //     ...prev,
  //     [sectionIndex]: activeIndex
  //   }));
  // };

  const scrollToNextSection = () => {
    const main = document.querySelector('main');
    if (main) {
      main.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  const handleShowPopup = (projectTitle: string) => {
    const project = projectsData.find(p => p.title === projectTitle);
    setPopupProjectTitle(projectTitle);
    setPopupProjectDescription(project?.description || '');
    // Close AboutPopup if open
    setShowAboutPopup(false);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    // Temporarily disable AboutPopup opening
    setCanOpenAboutPopup(false);
    setTimeout(() => {
      setCanOpenAboutPopup(true);
    }, 100);
  };

  const handleShowAboutPopup = () => {
    // Don't open if ProjectPopup is currently open or if temporarily disabled
    if (showPopup || !canOpenAboutPopup) return;
    
    // Close ProjectPopup if open
    setShowPopup(false);
    setShowAboutPopup(true);
  };

  const handleCloseAboutPopup = () => {
    setShowAboutPopup(false);
  };


  // Prevent browser navigation gestures more selectively
  useEffect(() => {
    // Only prevent browser navigation when at the edge of the page
    const preventEdgeNavigation = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch && touch.clientX < 50) { // Only prevent when very close to left edge
        const carousel = (e.target as Element)?.closest('[data-carousel]');
        if (!carousel) { // Only prevent if not inside a carousel
          e.preventDefault();
        }
      }
    };

    document.addEventListener('touchstart', preventEdgeNavigation, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventEdgeNavigation);
    };
  }, []);

  // Hide address bar for immersive experience
  useEffect(() => {
    // Function to hide address bar
    const hideAddressBar = () => {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        window.scrollTo(0, 1);
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 0);
      }, 100);
    };

    // Hide on initial load
    hideAddressBar();

    // Hide when orientation changes
    const handleOrientationChange = () => {
      setTimeout(hideAddressBar, 100);
    };

    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return (
    <>
      {/* Fixed Logo Containers - Outside main container for proper viewport positioning */}
      <LogoTop 
        onClick={handleShowAboutPopup}
        isHero={currentSectionIndex === 0}
        showAboutPopup={showAboutPopup}
        showPopup={showPopup}
        isMobile={isMobile}
      />
      <LogoBottom 
        onClick={handleShowAboutPopup}
        isHero={currentSectionIndex === 0}
        showAboutPopup={showAboutPopup}
        showPopup={showPopup}
        isMobile={isMobile}
      />
      
      {/* Hamburger Menu */}
      <HamburgerMenu projectTitles={projectTitles} />

      <main 
        className="h-screen overflow-y-scroll snap-y snap-mandatory"
        style={{ 
          scrollBehavior: 'smooth',
          scrollSnapType: 'y mandatory'
        }}
      >
      
      {/* Hero Section */}
      <Hero heroImage={heroImage} isAboutPopupVisible={showAboutPopup} />
      
      {/* CSS Carousel Test Section - Maria Bodil for Smart */}
      <section 
        id="css-carousel-test"
        className="relative h-screen w-full snap-start"
        style={{
          backgroundColor: 'white'
        }}>
        {/* <div className="absolute top-4 left-4 z-50 bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
          CSS CAROUSEL TEST (6 images)
        </div> */}
        <CarouselProvider>
          <CarouselWrapper 
            mediaItems={testSmartImages}
            isFirstCarousel={true}
            forceCSSCarousel={true}
            projectTitle="Maria Bodil for Smart"
            onNextSection={scrollToNextSection}
            onShowPopup={handleShowPopup}
            isPopupVisible={showPopup}
            isAboutPopupVisible={showAboutPopup}
          />
          
          {/* Navigation Hints now handled by CSS ::scroll-button() */}
        </CarouselProvider>
      </section>
      
      {/* Project Sections */}
      {projectsData.map((project, index) => (
        <section 
          key={project.title} 
          id={`project-${index}`}
          className="relative h-screen w-full snap-start">
          <CarouselProvider>
            {USE_CSS_CAROUSEL ? (
              <CarouselWrapper 
                mediaItems={project.images}
                isFirstCarousel={false}
                forceCSSCarousel={true}
              />
            ) : (
              <SwipeCarousel 
                mediaItems={project.images}
                isFirstCarousel={false}
              />
            )}
            {currentSectionIndex === index + 2 && (
              <ProjectTitle
                title={project.title}
                onNextSection={scrollToNextSection}
                onShowPopup={handleShowPopup}
                isPopupVisible={showPopup}
                isAboutPopupVisible={showAboutPopup}
              />
            )}
            
            {/* Navigation Hints now handled by CSS ::scroll-button() */}
          </CarouselProvider>
        </section>
      ))}

      {/* Project Index */}
      <ProjectIndex projectTitles={projectTitles} />

      </main>

      {/* Global Popup - Positioned relative to viewport */}
      <ProjectPopup 
        isVisible={showPopup}
        onClose={handleClosePopup}
        projectTitle={popupProjectTitle}
        projectDescription={popupProjectDescription}
      />

      {/* About Popup - Positioned relative to viewport */}
      <AboutPopup 
        isVisible={showAboutPopup}
        onClose={handleCloseAboutPopup}
      />

    </>
  );
}

export default App;
