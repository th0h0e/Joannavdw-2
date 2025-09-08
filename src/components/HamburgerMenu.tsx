import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectNavigation from './ProjectNavigation';

type HamburgerMenuProps = {
  projectTitles: string[];
  isPopupVisible?: boolean;
};

export default function HamburgerMenu({ projectTitles, isPopupVisible = false }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    // Don't allow opening menu when popups are visible
    if (isPopupVisible) return;
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      {!isPopupVisible && (
        <button
          onClick={toggleMenu}
          className="fixed top-[80px] right-5 md:top-[89px] md:right-[40px] z-[10000] cursor-pointer"
          aria-label="Toggle menu"
        >
          <motion.div
            className="block md:w-[18px] md:h-[18px]"
            style={{ 
              mixBlendMode: isOpen ? 'normal' : 'exclusion'
            }}
            animate={{
              rotate: isOpen ? 45 : 0,
              backgroundColor: isOpen ? '#000000' : '#ffffff',
              width: isOpen ? '18px' : (window.innerWidth >= 768 ? '18px' : '17.32px'),
              height: isOpen ? '18px' : (window.innerWidth >= 768 ? '18px' : '17.32px'),
            }}
            transition={{ duration: 0.3 }}
          />
        </button>
      )}

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-white z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeMenu}
            />

            {/* Menu Content */}
            <motion.div
              className="fixed inset-0 z-[9999] flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="w-full h-dvh overflow-y-auto">
                <div className="min-h-dvh flex items-center justify-center py-20">
                  <ProjectNavigation 
                    projectTitles={projectTitles}
                    onLinkClick={(index) => {
                      closeMenu();
                      
                      // Navigate after menu closes to avoid state conflicts
                      setTimeout(() => {
                        window.location.hash = `#project-${index}`;
                        
                        // Reset all carousels to first slide after navigation
                        setTimeout(() => {
                          const carousels = document.querySelectorAll('[data-carousel]');
                          carousels.forEach(carousel => {
                            if (carousel instanceof HTMLElement) {
                              carousel.scrollLeft = 0;
                            }
                          });
                        }, 100);
                      }, 300); // Wait for menu close animation
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}