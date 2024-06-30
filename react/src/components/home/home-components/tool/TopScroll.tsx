import React, { useState, useEffect } from "react";
import { animateScroll as scroll } from "react-scroll";

const ScrollToTopButton = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolling(true);
        if (timer) {
          clearTimeout(timer);
        }
        const newTimer = window.setTimeout(() => {
          setIsScrolling(false);
        }, 2000);
        setTimer(newTimer);
      } else {
        setIsScrolling(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  const scrollToTop = () => {
    scroll.scrollToTop({
      duration: 300,
      smooth: true,
    });
  };

  return (
    <button onClick={scrollToTop} className={`fixed right-3 md:right-9 bottom-1/3 transform -translate-y-1/2  text-primary px-3 py-2 border-1 border-primary hover:bg-primary hover:text-white transition-opacity duration-300 ${isScrolling ? "opacity-100" : "opacity-0"}`} style={{ visibility: isScrolling ? "visible" : "hidden" }}>
      Top
    </button>
  );
};

export default ScrollToTopButton;
