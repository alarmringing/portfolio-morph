'use client'

import { useRef, useEffect, useState, useCallback, createContext, useContext } from 'react';
import TextMorphEffect from './TextMorphEffect';
import Navbar from './Navbar';
import { GlyphType } from '../utils/textUtils';
import { clamp } from 'three/src/math/MathUtils.js';
import { usePathname, useRouter } from 'next/navigation';
import { TRANSITION_DURATION_S } from '../utils/transitions';
import '../page.css';
import '../fonts.css';

// Define the context type
interface TransitionContextType {
  handlePageExit: (callback: () => void) => void;
}

// Create the context
const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

// Custom hook to use the context
export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (context === undefined) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
};

interface SharedLayoutProps {
  children: React.ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
  const navbarRef = useRef<HTMLDivElement>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [isEntering, setIsEntering] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    if (pathname !== previousPathname.current) {
      setIsEntering(false);
      const timer = setTimeout(() => {
        setIsEntering(true);
      }, 10);

      previousPathname.current = pathname;
      return () => clearTimeout(timer);
    } else {
      const initialTimer = setTimeout(() => {
        setIsEntering(true);
      }, 10);
      return () => clearTimeout(initialTimer);
    }
  }, [pathname, hasMounted]);

  useEffect(() => {
    const handleScroll = () => {
      if (pathname !== '/') {
        setScrollProgress(1.0);
        return;
      }
      const aboutSection = window.innerHeight;
      const scrollPosition = window.scrollY;
      let progress = Math.min(scrollPosition / aboutSection, 1);
      progress = clamp(progress, 0, 1.0);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    const checkOrientation = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth;
      setIsPortrait(isPortraitMode);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    if (pathname === '/' && pendingScroll) {
      const section = document.getElementById(pendingScroll);
      if (section && navbarRef.current) {
        const navbarHeight = navbarRef.current.offsetHeight;
        requestAnimationFrame(() => {
          window.scrollTo({
            top: section.offsetTop - navbarHeight + window.innerHeight,
            behavior: 'instant'
          });
          setPendingScroll(null);
        });
      }
    }
  }, [pathname, pendingScroll]);

  // Function to handle page exit: fades out then calls back
  const handlePageExit = useCallback((callback: () => void) => {
    setIsEntering(false); // Start fade out
    setTimeout(callback, TRANSITION_DURATION_S * 1000); // Execute callback after duration
  }, []); // TRANSITION_DURATION_S is constant, no dependency needed

  const scrollToSection = useCallback((sectionId: string) => {
    // If not on homepage, handle exit transition first
    if (pathname !== '/') {
      setPendingScroll(sectionId); // Still set pending scroll target
      handlePageExit(() => { // <-- Now defined before use
        router.push('/'); // <-- Navigate in the callback
      });
      return; // Return after initiating exit
    }
    
    // Already on homepage, scroll directly
    const section = document.getElementById(sectionId);
    if (section && navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      window.scrollTo({
        top: section.offsetTop - navbarHeight + window.innerHeight,
        behavior: 'smooth'
      });
    }
  }, [pathname, router, handlePageExit]); // Keep handlePageExit in dependency array

  const morphingTextColor = `color-mix(in srgb, var(--morphing-text-color) ${100 - (scrollProgress * 100)}%, var(--letter-muted-color) ${scrollProgress * 100}%)`;

  const backgroundClass = pathname === '/' ? 'gradient-background' : 'fixed-background';

  // Determine transition class based on state
  const transitionClasses = [
    'transition-fade', // Base class with opacity 0, transition none
    hasMounted ? 'transition-fade-mounted' : '', // Add transition after mount
    hasMounted && isEntering ? 'transition-fade-entering' : '' // Add opacity 1 + ease-in when entering
  ].filter(Boolean).join(' '); // Filter out empty strings and join

  return (
    <div className={backgroundClass}>
      <div 
        className="fixed left-0 w-full"
        style={{
          filter: `blur(${scrollProgress * 15}px)`,
        }}
      >
        <div className="relative w-full h-full">
          <div className="absolute inset-0" style={{ zIndex: 2, mixBlendMode: 'multiply'}}>
            <TextMorphEffect  
              texts={[
                { text: 'Jihee', font: 'BagelFatOne, monospace', glyphType: GlyphType.L },
                { text: '지희', font: 'BagelFatOne, serif', glyphType: GlyphType.K },
                { text: 'ジヒ', font: 'PottaOne, serif', glyphType: GlyphType.J },
                { text: '智熙', font: 'PottaOne, serif', glyphType: GlyphType.C }
              ]} 
              width={70}
              defaultFont='NotoSerifCJK, serif'
              isPortrait={isPortrait}
              textColor={morphingTextColor}
              threshold={-140}
            />
          </div>
        </div>
      </div>

      <div ref={navbarRef} className="fixed top-0 w-full z-30">
        <Navbar 
          onAboutClick={() => scrollToSection('about')}
          onProjectsClick={() => scrollToSection('projects')}
        />
      </div>

      <TransitionContext.Provider value={{ handlePageExit }}>
        <div 
          className={`relative content-text latin-font ${transitionClasses}`}
        >
          <div className="relative z-10 bg-transparent p-8">
            {children}
          </div>
        </div>
      </TransitionContext.Provider>
    </div>
  );
} 