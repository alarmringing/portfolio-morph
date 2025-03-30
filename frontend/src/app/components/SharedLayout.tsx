import { useRef, useEffect, useState, useCallback } from 'react';
import TextMorphEffect from './TextMorphEffect';
import Navbar from './Navbar';
import { GlyphType } from '../utils/textUtils';
import { clamp } from 'three/src/math/MathUtils.js';
import SceneWrapper from '../canvas/SceneWrapper';
import { usePathname, useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import '../page.css';
import '../fonts.css';
import MouseEffect from './MouseEffect';

interface SharedLayoutProps {
  children: React.ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
  const aboutRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const [isNavItemHovered, setIsNavItemHovered] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (pathname !== '/') {
        setScrollProgress(1.0);
        return;
      }
      const aboutSection = window.innerHeight;
      const scrollPosition = window.scrollY;
      var progress = Math.min(scrollPosition / aboutSection, 1);
      progress = clamp(progress, 0, 1.0);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call immediately to set initial state
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

  // Execute scroll when we're on the homepage and have a pending scroll target
  useEffect(() => {
    if (pathname === '/' && pendingScroll) {
      const section = document.getElementById(pendingScroll);
      if (section && navbarRef.current) {
        const navbarHeight = navbarRef.current.offsetHeight;
        // Use requestAnimationFrame to ensure the DOM is fully loaded
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

  const scrollToSection = useCallback((sectionId: string) => {
    // If not on homepage, navigate to homepage first
    if (pathname !== '/') {
      // Set the pending scroll target before navigation
      setPendingScroll(sectionId);
      router.push('/');
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
  }, [pathname, router]);

  const handleNavItemHover = useCallback((isHovered: boolean) => {
    setIsNavItemHovered(isHovered);
  }, []);

  const morphingTextColor = `color-mix(in srgb, var(--morphing-text-color) ${100 - (scrollProgress * 100)}%, var(--letter-muted-color) ${scrollProgress * 100}%)`;

  // Determine background class based on the current route
  const backgroundClass = pathname === '/' ? 'gradient-background' : 'fixed-background';

  return (
    <div className={backgroundClass}>
      {/* Mouse effect overlay needs to be at the top level
      <MouseEffect isNavItemHovered={isNavItemHovered} scrollProgress={scrollProgress} /> */}
      
      {/* Hero section with morphing text */}
      <div 
        className="fixed left-0 w-full"
        style={{
          filter: `blur(${scrollProgress * 15}px)`,
        }}
      >
        {/* Create a stack with proper blend context */}
        <div className="relative w-full h-full">
          {/* Scene container - moved to be under the text
          <div className="absolute inset-0" style={{ zIndex: 1 }}>
            <SceneWrapper/>         
          </div> */}

          {/* Text morphing container positioned over the scene */}
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

      {/* Navbar */}
      <div ref={navbarRef} className="fixed top-0 w-full z-30">
        <Navbar 
          onAboutClick={() => scrollToSection('about')}
          onProjectsClick={() => scrollToSection('projects')}
          onNavItemHover={handleNavItemHover}
        />
      </div>

      {/* Content */}
      <div className="relative content-text latin-font">
        {/* Main content */}
        <div className="relative z-10 bg-transparent p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 