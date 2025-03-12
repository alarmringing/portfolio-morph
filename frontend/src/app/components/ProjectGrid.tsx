'use client'

import { useEffect, useRef } from 'react';
import { STRAPI_URL } from '@/strapi/strapi';
import styles from './ProjectGrid.module.css';
import { useProjects } from '../context/ProjectsContext';

export enum FilterType {
    All = 'all',
    Interactive = 'interactive',
    Static = 'static',
    Engineering = 'engineering'
}

interface ProjectGridProps {
    onGridClick: (id: number) => void;
}

export default function ProjectGrid({ onGridClick }: ProjectGridProps) {
  const isotope = useRef<any>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { projects, isLoading, activeFilter } = useProjects();

  // Initialize Isotope after component mounts and projects are loaded
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !projects.length) return;

    let isotopeInstance: any = null;

    const initIsotope = async () => {
      if (typeof window !== 'undefined') {
        const [Isotope, imagesLoaded] = await Promise.all([
          import('isotope-layout'),
          import('imagesloaded')
        ]);

        isotopeInstance = new Isotope.default(grid, {
          itemSelector: `.${styles.gridItem}`,
          layoutMode: 'masonry',
          masonry: {
            columnWidth: `.${styles.gridSizer}`,
            gutter: 20
          },
          stagger: 50,
          transitionDuration: '0.8s',
          hiddenStyle: {
            opacity: 0
          },
          visibleStyle: {
            opacity: 1
          }
        });

        // Now TypeScript understands the imagesLoaded API
        imagesLoaded.default(grid).on('progress', () => {
          if (isotopeInstance) {
            isotopeInstance.layout();
          }
        });
        
        isotope.current = isotopeInstance;

        // Apply initial filter if needed
      if (activeFilter !== FilterType.All) {
        isotopeInstance.arrange({
          filter: `.${activeFilter.toLowerCase()}`,
          transitionDuration: 0
        });
      }
      }
    };

    // Initialize Isotope
    initIsotope();

    // Cleanup
    return () => {
      if (isotopeInstance) {
        isotopeInstance.destroy();
      }
    };
  }, [projects]);

  // Handle filter changes
  useEffect(() => {
    if (!isotope.current) return;
    
    const filterValue = activeFilter === FilterType.All ? '*' : `.${activeFilter.toLowerCase()}`;
    console.log(filterValue);
    isotope.current.arrange({ filter: filterValue });
  }, [activeFilter]);

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div>
      <div ref={gridRef} className={styles.grid}>
        <div className={styles.gridSizer}></div>
        
        {projects.map((project) => {
          const imageUrl = project.Thumbnail ? 
            `${STRAPI_URL}${project.Thumbnail.url}` : null;
          return (
            <button 
              key={project.id} 
              className={`${styles.gridItem} ${project.Type?.toLowerCase()}`}
              onClick={() => onGridClick(project.id)}
            >
              <div className={styles.imageContainer}>
                {project.Thumbnail ? (
                  <img
                    src={imageUrl!}
                    alt={project.Title}
                    loading="lazy"
                  />
                ) : (
                  <div>No Image</div>
                )}
              </div>
              <div>
                <h3>{project.Title}</h3>
                {project.Type && (
                  <p>{project.Type}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
