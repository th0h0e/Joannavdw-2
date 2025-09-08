import { createContext, useContext, useState, type ReactNode } from 'react';

type CarouselContextType = {
  currentSlide: number;
  totalSlides: number;
  setCurrentSlide: (index: number) => void;
  setTotalSlides: (total: number) => void;
  // Browser detection
  isSafari: boolean;
  supportsScrollState: boolean;
  useJSFallback: boolean; // Derived: true if Safari or no scroll-state support
};

const CarouselContext = createContext<CarouselContextType | undefined>(undefined);

type CarouselProviderProps = {
  children: ReactNode;
  isSafari?: boolean;
  supportsScrollState?: boolean;
};

export function CarouselProvider({ 
  children, 
  isSafari = false, 
  supportsScrollState = false 
}: CarouselProviderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);

  // Derived value: use JavaScript fallback if Safari or no scroll-state support
  const useJSFallback = isSafari || !supportsScrollState;

  return (
    <CarouselContext.Provider value={{
      currentSlide,
      totalSlides,
      setCurrentSlide,
      setTotalSlides,
      isSafari,
      supportsScrollState,
      useJSFallback
    }}>
      {children}
    </CarouselContext.Provider>
  );
}

export function useCarousel() {
  const context = useContext(CarouselContext);
  if (context === undefined) {
    throw new Error('useCarousel must be used within a CarouselProvider');
  }
  return context;
}