import { useEffect, useState } from 'react';
import SwipeCarousel from './components/SwipeCarousel';
import ProjectIndex from './components/ProjectIndex';
import ProjectTitle from './components/ProjectTitle';
import ProjectPopup from './components/ProjectPopup';
import { CarouselProvider } from './contexts/CarouselContext';

// --- Import Logo SVGs ---
import Asset7Logo from './assets/logo svg/Asset 7.svg';
import Asset11Logo from './assets/logo svg/Asset 11.svg';

// --- Import Project Images ---
// Joep Hijwegen for The New Originals
import joepHijwegen1 from './assets/Image Assets/Joep Hijwegen for The New Originals /Joep Hijwegen for The New Originals.jpg';
import joepHijwegen2 from './assets/Image Assets/Joep Hijwegen for The New Originals /Joep Hijwegen for The New Originals 2.jpg';
import joepHijwegen3 from './assets/Image Assets/Joep Hijwegen for The New Originals /Joep Hijwegen for The New Originals 3.jpg';

// Joost Termeer x The F Vintage
import joostTermeer1 from './assets/Image Assets/Joost Termeer x The F Vintage/Joost Termeer work for his own The F Vintage.jpg';
import joostTermeer2 from './assets/Image Assets/Joost Termeer x The F Vintage/Joost Termeer work for his own The F Vintage 2.jpg';
import joostTermeer3 from './assets/Image Assets/Joost Termeer x The F Vintage/Joost Termeer work for his own The F Vintage 3.jpg';

// Maria Bodil for Maedenofficial
import mariaMaeden1 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial.jpg';
import mariaMaeden2 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial 2.jpg';
import mariaMaeden3 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial 3.jpg';
import mariaMaeden4 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial 4.jpg';
import mariaMaeden5 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial 5.jpg';
import mariaMaeden6 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial 6.jpg';
import mariaMaeden7 from './assets/Image Assets/Maria Bodil for Maedenofficial/Maria Bodil for @maedenofficial 7.jpg';

// Maria Bodil for Nike
import mariaNike1 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign.jpg';
import mariaNike2 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign 2.jpg';
import mariaNike3 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign 3.jpg';
import mariaNike4 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign 4.jpg';
import mariaNike5 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign 5.jpg';
import mariaNike6 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign 6.jpg';
import mariaNike7 from './assets/Image Assets/Maria Bodil for Nike/Maria Bodil for Nike New Tech Fleece campaign 7.jpg';

// Maria Bodil for Smart
import mariaSmart1 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil for Smart.jpg';
import mariaSmart2 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil for Smart 2.jpg';
import mariaSmart3 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil for Smart 3.jpg';
import mariaSmart4 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil, celebrating 25 years of SMART.jpg';
import mariaSmart5 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil, celebrating 25 years of SMART 2.jpg';
import mariaSmart6 from './assets/Image Assets/Maria Bodil for Smart/Maria Bodil, celebrating 25 years of SMART 3.jpg';

// Maria Bodil for Vogue Netherlands
import mariaVogue1 from './assets/Image Assets/Maria Bodil for Vogue Netherlands/Maria Bodil for Vogue Netherlands. Production by Spark Productions.jpg';
import mariaVogue2 from './assets/Image Assets/Maria Bodil for Vogue Netherlands/Maria Bodil for Vogue Netherlands. Production by Spark Productions 2.jpg';
import mariaVogue3 from './assets/Image Assets/Maria Bodil for Vogue Netherlands/Maria Bodil for Vogue Netherlands. Production by Spark Productions 3.jpg';

// Sander Coers - Personal Work
import sanderPersonal1 from './assets/Image Assets/Sander Coers - Personal Work/New work by Sander Coers- POST.jpg';
import sanderPersonal2 from './assets/Image Assets/Sander Coers - Personal Work/New work by Sander Coers- POST 2.jpg';
import sanderPersonal3 from './assets/Image Assets/Sander Coers - Personal Work/New work by Sander Coers- POST 3.jpg';
import sanderPersonal4 from './assets/Image Assets/Sander Coers - Personal Work/New work by Sander Coers- POST 4.jpg';
import sanderPersonal5 from './assets/Image Assets/Sander Coers - Personal Work/New work by Sander Coers- POST 5.jpg';

// Sander Coers for Essentiel Antwerp
import sanderEssentiel1 from './assets/Image Assets/Sander Coers for Essentiel Antwerp/Sander Coers for Essentiel Antwerp.jpg';
import sanderEssentiel2 from './assets/Image Assets/Sander Coers for Essentiel Antwerp/Sander Coers for Essentiel Antwerp 2.jpg';
import sanderEssentiel3 from './assets/Image Assets/Sander Coers for Essentiel Antwerp/Sander Coers for Essentiel Antwerp 3.jpg';
import sanderEssentiel4 from './assets/Image Assets/Sander Coers for Essentiel Antwerp/Sander Coers for Essentiel Antwerp.  @Sandercoers @essentielantwerp.jpg';
import sanderEssentiel5 from './assets/Image Assets/Sander Coers for Essentiel Antwerp/Sander Coers for Essentiel Antwerp.  @Sandercoers @essentielantwerp -  - 2025-05-02 13-48-42.jpg';
import sanderEssentiel6 from './assets/Image Assets/Sander Coers for Essentiel Antwerp/Sander Coers for Essentiel Antwerp.  @Sandercoers @essentielantwerp -  - 2025-05-02 13-48-47.jpg';

// Sander Coers for PAL Sporting Goods
import sanderPAL1 from './assets/Image Assets/Sander Coers for PAL Sporting Goods/Sander Coers for PAL Sporting Goods Autumn Winter \'23..jpg';
import sanderPAL2 from './assets/Image Assets/Sander Coers for PAL Sporting Goods/Sander Coers for PAL Sporting Goods Autumn Winter \'23 2.jpg';
import sanderPAL3 from './assets/Image Assets/Sander Coers for PAL Sporting Goods/Sander Coers for PAL Sporting Goods Autumn Winter \'23 3.jpg';

// Sander Coers for Sine & Cosine
import sanderSine1 from './assets/Image Assets/Sander Coers for Sine & Cosine/Sine Cosine Photo by @sandercoers.jpg';
import sanderSine2 from './assets/Image Assets/Sander Coers for Sine & Cosine/Sine Cosine Photo by @sandercoers.jpg 2.jpg';
import sanderSine3 from './assets/Image Assets/Sander Coers for Sine & Cosine/Sine Cosine Photo by @sandercoers.jpg 3.jpg';

// Set design images Joost Termeer
import setDesign1 from './assets/Image Assets/Set design images Joost Termeer/Here are the first set design images shot by Joost Termeer together with @studionicklankveld & @melissavanheijst.leather.jpg';
import setDesign2 from './assets/Image Assets/Set design images Joost Termeer/Here are the first set design images shot by Joost Termeer together with @studionicklankveld & @melissavanheijst.leather 2.jpg';
import setDesign3 from './assets/Image Assets/Set design images Joost Termeer/Here are the first set design images shot by Joost Termeer together with @studionicklankveld & @melissavanheijst.leather 3.jpg';

// Suus Waijers for PRADA
import suusPrada1 from './assets/Image Assets/Suus Waijers for PRADA/Suus Waijers for PRADA via Underpromise.jpg';
import suusPrada2 from './assets/Image Assets/Suus Waijers for PRADA/Suus Waijers for PRADA via Underpromise 2.jpg';
import suusPrada3 from './assets/Image Assets/Suus Waijers for PRADA/Suus Waijers for PRADA via Underpromise 3.jpg';

// --- Project Data Arrays ---
const joepHijwegenImages = [
  { src: joepHijwegen1 },
  { src: joepHijwegen2 },
  { src: joepHijwegen3 },
];

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

const sanderPALImages = [
  { src: sanderPAL1 },
  { src: sanderPAL2 },
  { src: sanderPAL3 },
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

// --- Project Description Text ---
const projectDescription = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet. Pellentesque commodo lacus at sodales sodales. Quisque sagittis orci ut diam condimentum, vel euismod erat placerat. In iaculis arcu eros, eget tempus orci facilisis id.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.";

// --- Project Data Array ---
const projectsData = [
  { title: "Joep Hijwegen for The New Originals", description: projectDescription, images: joepHijwegenImages },
  { title: "Joost Termeer x The F Vintage", description: projectDescription, images: joostTermeerImages },
  { title: "Maria Bodil for Maedenofficial", description: projectDescription, images: mariaMaedenImages },
  { title: "Maria Bodil for Nike", description: projectDescription, images: mariaNikeImages },
  { title: "Maria Bodil for Smart", description: projectDescription, images: mariaSmartImages },
  { title: "Maria Bodil for Vogue Netherlands", description: projectDescription, images: mariaVogueImages },
  { title: "Sander Coers - Personal Work", description: projectDescription, images: sanderPersonalImages },
  { title: "Sander Coers for Essentiel Antwerp", description: projectDescription, images: sanderEssentielImages },
  { title: "Sander Coers for PAL Sporting Goods", description: projectDescription, images: sanderPALImages },
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

  // Track which section is currently visible
  useEffect(() => {
    const handleScroll = () => {
      const main = document.querySelector('main');
      if (main) {
        const scrollTop = main.scrollTop;
        const sectionIndex = Math.round(scrollTop / window.innerHeight);
        setCurrentSectionIndex(Math.min(sectionIndex, projectsData.length)); // Include index page
      }
    };

    const main = document.querySelector('main');
    if (main) {
      main.addEventListener('scroll', handleScroll);
      return () => main.removeEventListener('scroll', handleScroll);
    }
  }, []);

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
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
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

  return (
    <>
      <main 
        className="h-screen overflow-y-scroll snap-y snap-mandatory"
        style={{ 
          scrollBehavior: 'smooth',
          scrollSnapType: 'y mandatory'
        }}
      >
      
      {/* Fixed Logo Containers */}
      <div className="fixed left-1/2 -translate-x-1/2 z-10" style={{ top: '100px', mixBlendMode: 'exclusion' }}>
        <img 
          src={Asset7Logo} 
          alt="Joanna Logo Top"
          className="w-24 md:w-30 lg:w-36 h-auto"
        />
      </div>
      
      <div className="fixed left-1/2 -translate-x-1/2 z-10" style={{ bottom: '100px', mixBlendMode: 'exclusion' }}>
        <img 
          src={Asset11Logo} 
          alt="Van Der Weg Logo Bottom"
          className="w-45 md:w-54 lg:w-60 h-auto"
        />
      </div>
      
      {/* Project Sections */}
      {projectsData.map((project, index) => (
        <section 
          key={project.title} 
          id={`project-${index}`}
          className="relative h-screen w-screen snap-start">
          <CarouselProvider>
            <SwipeCarousel 
              mediaItems={project.images} 
            />
            {currentSectionIndex === index && (
              <ProjectTitle
                title={project.title}
                onNextSection={scrollToNextSection}
                onShowPopup={handleShowPopup}
                isPopupVisible={showPopup}
              />
            )}
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

    </>
  );
}

export default App;
