import { motion, AnimatePresence } from 'framer-motion';
import ProjectCardSVG from '../assets/Project Card/JVDW WEB LIGHT BOX copy.svg';
import Asset7Logo from '../assets/logo svg/Asset 7.svg';
import Asset11Logo from '../assets/logo svg/Asset 11.svg';

type AboutPopupProps = {
  isVisible: boolean;
  onClose: () => void;
};

export default function AboutPopup({ isVisible, onClose }: AboutPopupProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Invisible Backdrop for click-to-close */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            className="fixed z-50"
            style={{ 
              top: '50%', 
              left: '50%', 
              width: '280px',
              position: 'fixed',
              transform: 'translate(-50%, -50%) scale(var(--scale, 1))'
            }}
            initial={{ '--scale': 0.8, opacity: 0 } as any}
            animate={{ '--scale': 1, opacity: 1 } as any}
            exit={{ '--scale': 0.8, opacity: 0 } as any}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="relative">
              <img 
                src={ProjectCardSVG} 
                alt="About Card"
                className="w-full h-auto"
                style={{ 
                  width: '280px', 
                  height: 'auto',
                  filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.15))'
                }}
              />
              
              {/* About Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between px-4 py-8">
                {/* Top Logo */}
                <div className="flex justify-center">
                  <img 
                    src={Asset7Logo} 
                    alt="Joanna Logo"
                    style={{ 
                      width: '4.5rem',  // Increased from 4rem
                      height: 'auto',
                      filter: 'brightness(0)'  // Makes it black, no blend mode
                    }}
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h2 
                    className="text-black uppercase text-center leading-tight"
                    style={{ 
                      fontFamily: 'EnduroWeb, sans-serif',
                      letterSpacing: '0.03em',
                      fontSize: '12px',
                      marginBottom: '18px'
                    }}
                  >
                    Story Driven Strategy
                  </h2>
                <p 
                  className="text-black text-center leading-tight"
                  style={{ 
                    fontFamily: 'EnduroWeb, sans-serif',
                    letterSpacing: '0.03em',
                    fontSize: '12px',
                    marginBottom: '18px'
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis ipsum vel nulla blandit, eu porta ligula mattis. Phasellus mattis rutrum elit, sed cursus risus tempus quis. Mauris sed ante et lectus consectetur aliquet. Sed in orci a metus aliquam porttitor.
                </p>
                
                <h3 
                  className="text-black uppercase text-center leading-tight"
                  style={{ 
                    fontFamily: 'EnduroWeb, sans-serif',
                    letterSpacing: '0.03em',
                    fontSize: '12px',
                    marginBottom: '18px'
                  }}
                >
                  Expertise
                </h3>
                <p 
                  className="text-black text-center leading-tight"
                  style={{ 
                    fontFamily: 'EnduroWeb, sans-serif',
                    letterSpacing: '0.03em',
                    fontSize: '12px',
                    marginBottom: '18px'
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis ipsum vel nulla blandit.
                </p>
                
                <h3 
                  className="text-black uppercase text-center leading-tight"
                  style={{ 
                    fontFamily: 'EnduroWeb, sans-serif',
                    letterSpacing: '0.03em',
                    fontSize: '12px',
                    marginBottom: '18px'
                  }}
                >
                  Selected Clients
                </h3>
                <p 
                  className="text-black text-center leading-tight"
                  style={{ 
                    fontFamily: 'EnduroWeb, sans-serif',
                    letterSpacing: '0.03em',
                    fontSize: '12px',
                    marginBottom: '18px'
                  }}
                >
                  Ipsum, Dolor, Sit Amet, Consectetur, Adipiscing, Aenean, Mattis, Blandit.
                </p>
                
                <button 
                  className="text-black text-center leading-tight cursor-pointer hover:opacity-70 transition-opacity duration-300"
                  style={{ 
                    fontFamily: 'EnduroWeb, sans-serif',
                    letterSpacing: '0.03em',
                    fontSize: '12px',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    width: '100%'
                  }}
                  onClick={() => {
                    // You can add email link or contact functionality here
                    window.location.href = 'mailto:hello@joannavanderwerf.com';
                  }}
                >
                  Get in touch
                </button>
                </div>
                
                {/* Bottom Logo */}
                <div className="flex justify-center">
                  <img 
                    src={Asset11Logo} 
                    alt="Van Der Weg Logo"
                    style={{ 
                      width: '8rem',  // Increased from 7rem
                      height: 'auto',
                      filter: 'brightness(0)'  // Makes it black, no blend mode
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}