'use client'

import SceneWrapper from './canvas/SceneWrapper'
import { useRef, useEffect, useState } from 'react'
import { AboutData } from '@/strapi/StrapiData'
import { renderNode } from '@/strapi/StrapiRenderNodes'
import { FilterType } from './components/ProjectGrid'
import ProjectGrid from './components/ProjectGrid'
import { getAbout } from '@/strapi/strapi'
import TextMorphEffect from './components/TextMorphEffect'
import './page.css'
import './fonts.css'
import { GlyphType } from './utils/textUtils'
import { clamp } from 'three/src/math/MathUtils.js'
import ProjectFilterButton from './components/ProjectButtonFilter'

export default function Home() {
  const aboutRef = useRef<HTMLDivElement>(null)
  const projectsRef = useRef<HTMLDivElement>(null)
  const navbarRef = useRef<HTMLDivElement>(null)
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const [isPortrait, setIsPortrait] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.All)


  useEffect(() => {
    const handleScroll = () => {
      // Calculate how far we've scrolled as a percentage
      // We want the effect to complete by the time we reach the about section
      const aboutSection = window.innerHeight
      const scrollPosition = window.scrollY
      var progress = Math.min(scrollPosition / aboutSection, 1)
      progress = clamp(progress, 0, 1.0);
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const loadAboutData = async () => {
      try {
        const response = await getAbout();
        setAboutData(response);
      } catch (error) {
        console.error('Error loading about data:', error);
      }
    };

    loadAboutData();
  }, []);

  // Detect orientation
  useEffect(() => {
    const checkOrientation = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth;
      setIsPortrait(isPortraitMode);
    };
    
    // Check on mount
    checkOrientation();
    
    // Add listener for resize events
    window.addEventListener('resize', checkOrientation);
    
    // Clean up
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current || !navbarRef.current) return;
    const navbarHeight = navbarRef.current.offsetHeight;
    const targetPosition = window.scrollY + ref.current.getBoundingClientRect().top;
    window.scrollTo({
      top: targetPosition - navbarHeight,
      behavior: 'smooth'
    });
  }

  const morphingTextColor = `color-mix(in srgb, var(--accent-color) ${100 - (scrollProgress * 100)}%, var(--letter-muted-color) ${scrollProgress * 100}%)`;

  return (
    <div className="gradient-background">
      {/* Fixed cube section */}

      {/* Hero section with morphing text */}
      <div 
        className="fixed top-1/2 left-0 w-full"
        style={{
          //transform: `translateY(${Math.pow(scrollProgress / 0.8, 2.0) * -10}vh)`,
          //opacity: 1 - Math.pow(scrollProgress * 1.2, 1.0),
          filter: `blur(${scrollProgress * 15}px)`,
        }}
      >
        <TextMorphEffect 
          texts={[{ text: 'JIHEE', font: 'BagelFatOne, serif', glyphType: GlyphType.L },
            { text: '지희', font: 'BagelFatOne, serif', glyphType: GlyphType.K },
            { text: 'ジヒ', font: 'PottaOne, serif', glyphType: GlyphType.J },
            { text: '智熙', font: 'PottaOne, serif', glyphType: GlyphType.C }]} 
          width={70}
          color={morphingTextColor}
          defaultFont='NotoSerifCJK, serif'
          isPortrait={isPortrait}
          threshold={-140}
        />
      </div>

      {/* Navbar */}
      <div ref={navbarRef} className="fixed top-0 w-full z-30">
          <nav className="flex justify-between px-8 py-4 latin-font ">
            <button 
              onClick={() => scrollToSection(aboutRef)}
              className="htransition-colors navbar-text"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection(projectsRef)}
              className="transition-colors navbar-text"
            >
              Projects
            </button>
          </nav>
        </div>

      {/* Scrollable content */}
      <div className="relative content-text latin-font">
      
        {/* Spacer to push content below viewport */}
        <div className="h-screen" />

        {/* content */}
        <div className="relative z-10 bg-transparent p-8"> 
        <section ref={aboutRef} className="min-h-screen ">
          <div className="max-w-4xl mx-auto ">
            {aboutData ? (
              <div >
                {aboutData.data.description.map((block, index) => (
                  <div key={index}>{renderNode(block)}</div>
                ))}
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </section>

          <section ref={projectsRef} className="max-h-screen">
            <div className="max-w-6xl ml-auto mr-8 min-h-[500px]">
                <ProjectGrid activeFilter={activeFilter} />
            </div>
            <div className="bottom-8 left-8 flex flex-col z-30" style={{position: 'sticky'}}>
              <ProjectFilterButton 
                filter={FilterType.All}
                activeFilter={activeFilter}
                onClick={setActiveFilter}
              />
              <ProjectFilterButton 
                filter={FilterType.Interactive}
                activeFilter={activeFilter}
                onClick={setActiveFilter}
              />
              <ProjectFilterButton 
                filter={FilterType.Static}
                activeFilter={activeFilter}
                onClick={setActiveFilter}
              />
              <ProjectFilterButton 
                filter={FilterType.Engineering}
                activeFilter={activeFilter}
                onClick={setActiveFilter}
              />
            </div>
           </section>
        </div>
      </div>
    </div>
  )
}
