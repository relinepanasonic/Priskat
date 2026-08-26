"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function BookPager() {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const container = document.querySelector('.book-container');
    if (!container) return;

    const checkScroll = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 5
      );
    };

    container.addEventListener('scroll', checkScroll);
    // Initial check after a slight delay to allow layout
    setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scrollLeft = () => {
    const container = document.querySelector('.book-container');
    if (container) {
      container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.querySelector('.book-container');
    if (container) {
      container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="hidden md:block absolute inset-y-0 left-0 right-0 pointer-events-none z-10">
      {canScrollLeft && (
        <button 
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/50 hover:bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-black pointer-events-auto transition-all"
        >
          <ChevronLeft className="h-8 w-8 ml-1" />
        </button>
      )}
      
      {canScrollRight && (
        <button 
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/50 hover:bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-black pointer-events-auto transition-all"
        >
          <ChevronRight className="h-8 w-8 mr-1" />
        </button>
      )}
    </div>
  );
}
