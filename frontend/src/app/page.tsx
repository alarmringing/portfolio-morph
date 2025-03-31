'use client'

import { useEffect, useState } from 'react'
import { AboutData } from '@/strapi/StrapiData'
import { renderNode } from '@/strapi/StrapiRenderNodes'
import { FilterType } from './context/ProjectsContext';
import ProjectGrid from './components/ProjectGrid'
import { getAbout } from '@/strapi/strapi'
import ProjectFilterButton from './components/ProjectButtonFilter'
import { useRouter } from 'next/navigation'
import { useTransition } from './components/SharedLayout';

export default function Home() {
  const router = useRouter();
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const { handlePageExit } = useTransition();

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

  const handleGridClick = (documentId: string) => {
    handlePageExit(() => {
      router.push(`/project/${documentId}`);
    });
  };

  return (
    <div>
      {/* Spacer to push content below viewport */}
      <div className="h-screen" />
      
      {/* Content */}
      <div className="relative content-text latin-font">
        {/* About section with vertically centered content */}
        <section id="about" className="min-h-screen flex items-center justify-center">
          <div className="max-w-4xl mx-auto">
            {aboutData ? (
              <div>
                {aboutData.data.description.map((block, index) => (
                  <div key={index}>{renderNode(block)}</div>
                ))}
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </section>

        {/* Projects section */}
        <section id="projects">
          <div>
            <ProjectGrid 
              onGridClick={handleGridClick}
            />
          </div>
          <div className="filterbuttons">
            <ProjectFilterButton 
              filter={FilterType.All}
            />
            <ProjectFilterButton 
              filter={FilterType.Interactive}
            />
            <ProjectFilterButton 
              filter={FilterType.Static}
            />
            <ProjectFilterButton 
              filter={FilterType.Rnd}
            />
            <ProjectFilterButton 
              filter={FilterType.Music}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
