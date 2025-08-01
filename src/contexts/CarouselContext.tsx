import { createContext, useContext, useState, type ReactNode } from 'react';

type CarouselContextType = {
  currentSlide: number;
  totalSlides: number;
  isScrolling: boolean;
  setCurrentSlide: (index: number) => void;
  setTotalSlides: (total: number) => void;
  setIsScrolling: (scrolling: boolean) => void;
};

const CarouselContext = createContext<CarouselContextType | undefined>(undefined);

export function CarouselProvider({ children }: { children: ReactNode }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  return (
    <CarouselContext.Provider value={{
      currentSlide,
      totalSlides,
      isScrolling,
      setCurrentSlide,
      setTotalSlides,
      setIsScrolling
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