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
      // Allow 10px threshold for browser rounding errors
      setCanScrollLeft(container.scrollLeft > 10);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    };

    container.addEventListener('scroll', checkScroll);
    
    // Check initially and also wait for images/fonts
    setTimeout(checkScroll, 100);
    setTimeout(checkScroll, 500);
    setTimeout(checkScroll, 1000);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scrollLeft = () => {
    const container = document.querySelector('.book-container');
    if (container) {
      // Scroll by exactly one viewport width
      container.scrollBy({ left: -(container.clientWidth), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.querySelector('.book-container');
    if (container) {
      container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="hidden md:block absolute inset-y-0 left-0 right-0 pointer-events-none z-20">
      
      {/* Left Click Zone */}
      {canScrollLeft && (
        <div 
          onClick={scrollLeft}
          className="absolute left-0 top-0 bottom-0 w-32 cursor-pointer pointer-events-auto flex items-center group"
        >
          <button className="absolute left-2 w-12 h-12 bg-white/50 group-hover:bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 group-hover:text-black transition-all">
            <ChevronLeft className="h-8 w-8 ml-1" />
          </button>
        </div>
      )}
      
      {/* Right Click Zone */}
      {canScrollRight && (
        <div 
          onClick={scrollRight}
          className="absolute right-0 top-0 bottom-0 w-32 cursor-pointer pointer-events-auto flex items-center justify-end group"
        >
          <button className="absolute right-2 w-12 h-12 bg-white/50 group-hover:bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 group-hover:text-black transition-all">
            <ChevronRight className="h-8 w-8 mr-1" />
          </button>
        </div>
      )}
    </div>
  );
}
