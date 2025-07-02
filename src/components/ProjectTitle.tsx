import { motion, AnimatePresence } from 'framer-motion';
import { useCarousel } from '../contexts/CarouselContext';

type ProjectTitleProps = {
  title: string;
  onNextSection: () => void;
  onShowPopup: (projectTitle: string) => void;
  isPopupVisible: boolean;
};

export default function ProjectTitle({ title, onNextSection, onShowPopup, isPopupVisible }: ProjectTitleProps) {
  const { currentSlide, totalSlides } = useCarousel();
  const handleTitleClick = () => {
    if (currentSlide === totalSlides - 1) {
      onNextSection();
    } else {
      onShowPopup(title);
    }
  };

  const isLastSlide = currentSlide === totalSlides - 1;

  return (
    <>
      {/* Project Title - Positioned relative to section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-4/5 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence mode="wait">
            {!isPopupVisible && (
              <motion.h1 
                className="text-white text-2xl md:text-4xl lg:text-5xl text-center drop-shadow-2xl px-6 py-3 uppercase leading-tight cursor-pointer hover:opacity-80"
                style={{ fontFamily: 'EnduroWeb, sans-serif', letterSpacing: '0.03em' }}
                key={isLastSlide ? 'next-project' : 'project-title'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={handleTitleClick}
              >
                {isLastSlide ? 'NEXT PROJECT' : title}
              </motion.h1>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}