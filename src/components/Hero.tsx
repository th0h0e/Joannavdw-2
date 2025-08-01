import { motion, AnimatePresence } from 'framer-motion';
import feather from 'feather-icons';
import { projectTitleClasses, projectTitleStyle } from '../utils/sharedStyles';

type HeroProps = {
  heroImage: string;
  isAboutPopupVisible: boolean;
};

export default function Hero({ heroImage, isAboutPopupVisible }: HeroProps) {
  return (
    <section 
      id="hero-section"
      className="relative h-screen w-full snap-start bg-white flex items-center justify-center overflow-hidden"
    >
      {/* Hero Background Image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        initial={{ scale: 0.3 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      
      
      {/* Hero Headline */}
      <AnimatePresence>
        {!isAboutPopupVisible && (
          <motion.div
            className="absolute top-1/2 left-1/2 z-10 text-center w-full px-6 md:px-0"
            style={{ 
              transform: 'translate(-50%, -50%) translateY(var(--y, 0px))',
              '--y': '0px'
            } as any}
            initial={{ opacity: 0, '--y': '20px' }}
            animate={{ opacity: 1, '--y': '0px' }}
            exit={{ opacity: 0, '--y': '20px' }}
            transition={{ duration: 0.3 }}
          >
            <h1 
              className={`text-white ${projectTitleClasses}`}
              style={projectTitleStyle}
            >
              Creative Strategy and Communication
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Scroll Hint */}
      <div
        className="absolute bottom-8 z-10 text-white w-6 h-6"
        style={{ left: '50%', marginLeft: '-12px', opacity: 1 }}
      >
        <div 
          className="text-white drop-shadow-2xl w-full h-full"
          dangerouslySetInnerHTML={{ 
            __html: feather.icons['chevron-down'].toSvg({ 
              width: window.innerWidth >= 768 ? 28 : 24, 
              height: window.innerWidth >= 768 ? 28 : 24, 
              color: 'white' 
            }) 
          }} 
        />
      </div>
    </section>
  );
}