import { createContext, useContext, useState, type ReactNode } from 'react';

type CarouselContextType = {
  currentSlide: number;
  totalSlides: number;
  setCurrentSlide: (index: number) => void;
  setTotalSlides: (total: number) => void;
};

const CarouselContext = createContext<CarouselContextType | undefined>(undefined);

export function CarouselProvider({ children }: { children: ReactNode }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);

  return (
    <CarouselContext.Provider value={{
      currentSlide,
      totalSlides,
      setCurrentSlide,
      setTotalSlides
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