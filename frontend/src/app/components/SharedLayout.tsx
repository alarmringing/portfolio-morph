'use client'

import { useRef, useEffect, useState, useCallback, createContext, useContext } from 'react';
import TextMorphEffect from './TextMorphEffect';
import Navbar from './Navbar';
import { GlyphType } from '../utils/textUtils';
import { clamp } from 'three/src/math/MathUtils.js';
import { usePathname, useRouter } from 'next/navigation';
import '../page.css';
import '../fonts.css';
import { IS_SAFARI } from '../utils/browserUtils';

// Define the context type
interface TransitionContextType {
  handlePageExit: (callback: () => void) => void;
}

// Create the context
const TransitionContext = createContext<TransitionContextType | undefined>(undefined);
const TRANSITION_DURATION_S = 0.4;

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
  const [textMorphScale, setTextMorphScale] = useState(1.5); // Default scale
  const [circleSize, setCircleSize] = useState(100); // Initial value
  const [areFontsLoaded, setAreFontsLoaded] = useState(false); // State for font loading

  const isHomepage = pathname === '/';

  useEffect(() => {
    setHasMounted(true);
    // Check for Safari only after mounting on the client
    if (IS_SAFARI) {
      setTextMorphScale(3.5);
    }
  }, []);

  // Effect to load fonts
  useEffect(() => {
    // Ensure running on client-side where document.fonts is available
    if (typeof document !== 'undefined' && document.fonts) {
      Promise.all([
        document.fonts.load('1em BagelFatOne'), // Specify size and family
        document.fonts.load('1em PottaOne')      // Specify size and family
      ]).then(() => {
        setAreFontsLoaded(true);
      }).catch(err => {
        console.error('Font loading failed:', err);
        // Fallback: Still show the text even if fonts fail to load after timeout
        setAreFontsLoaded(true);
      });
    } else {
      // Fallback if document.fonts is not available (SSR or old browser)
      // Assume fonts are loaded or proceed without waiting
      setAreFontsLoaded(true);
    }
  }, []); // Run once on mount

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
        // Set circleSize directly when not on homepage
        setCircleSize(0); // Or whatever final state you want
        return;
      }
      const aboutSection = window.innerHeight;
      const scrollPosition = window.scrollY;
      let progress = Math.min(scrollPosition / aboutSection, 1);
      progress = clamp(progress, 0, 1.0);
      setScrollProgress(progress);
      setCircleSize(100 - (progress * 100));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]); // Added circleSize calculation here

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
    if (isHomepage && pendingScroll) {
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
    if (!isHomepage) {
      setPendingScroll(sectionId); // Still set pending scroll target
      handlePageExit(() => { 
        router.push('/');
      });
      return;
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
  const transitionClasses = [
    'transition-fade', // Base class with opacity 0, transition none
    hasMounted ? 'transition-fade-mounted' : '', // Add transition after mount
    hasMounted && isEntering ? 'transition-fade-entering' : '' // Add opacity 1 + ease-in when entering
  ].filter(Boolean).join(' '); // Filter out empty strings and join

  return (
    <div>
      {/* Spacer to push content below viewport */}
      { isHomepage && <div className="h-screen linear-gradient-background w-full"  />}  

      <div
        className="fixed top-0 left-0 w-full h-full"
      >
        <div 
        className="h-screen gradient-background w-full"
        style={{ '--circle-size': `${circleSize}%` } as React.CSSProperties} // Pass circleSize as CSS variable
        />

          {/* Apply fade-in effect to this wrapper div */}
          <div
            className="z-1"
            style={{
              opacity: areFontsLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out' // Adjust duration/easing as needed
            }}
          >
            <TextMorphEffect
              texts={[
                { text: 'Jihee', font: 'BagelFatOne, monospace', glyphType: GlyphType.L },
                { text: '지희', font: 'BagelFatOne, serif', glyphType: GlyphType.K },
                { text: 'ジヒ', font: 'PottaOne, serif', glyphType: GlyphType.J },
                { text: '智熙', font: 'PottaOne, serif', glyphType: GlyphType.C }
              ]}
              blurAmount={0 + scrollProgress * 15}
              width={80}
              scale={textMorphScale}
              defaultFont='NotoSerifCJK, serif'
              isPortrait={isPortrait}
              textColor={morphingTextColor}
            />
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
          className={`content-text latin-font ${transitionClasses}`}
        >
          <div className="relative bg-transparent">
            {children}
          </div>
        </div>
      </TransitionContext.Provider>

    </div>
  );
} 