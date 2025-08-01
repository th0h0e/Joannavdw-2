import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type HamburgerMenuProps = {
  projectTitles: string[];
};

export default function HamburgerMenu({ projectTitles }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-5 right-5 md:top-[89px] md:right-[40px] z-[10000] cursor-pointer"
        aria-label="Toggle menu"
      >
        <motion.div
          className="block"
          style={{ 
            width: '18px',
            height: '18px',
            mixBlendMode: isOpen ? 'normal' : 'exclusion'
          }}
          animate={{
            rotate: isOpen ? 45 : 0,
            backgroundColor: isOpen ? '#000000' : '#ffffff',
          }}
          transition={{ duration: 0.3 }}
        />
      </button>

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
              <div className="w-full h-full overflow-y-auto">
                {/* Modified ProjectIndex for menu */}
                <div className="min-h-full flex items-center justify-center py-20">
                  <div className="w-full md:w-4/5 text-center px-6 md:px-0">
                    <ul className="space-y-2">
                      {projectTitles.map((title, index) => (
                        <li key={index}>
                          <a 
                            href={`#project-${index}`}
                            className="text-black text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl uppercase leading-none block no-underline hover:underline transition-all duration-200"
                            style={{ 
                              fontFamily: 'EnduroWeb, sans-serif',
                              letterSpacing: '0.03em'
                            }}
                            onClick={(e) => {
                              e.preventDefault(); // Prevent immediate navigation
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
                          >
                            {title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}