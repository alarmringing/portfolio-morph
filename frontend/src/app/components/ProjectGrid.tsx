'use client'

import { useEffect, useRef, useState } from 'react';
import { getProjects, STRAPI_URL } from '@/strapi/strapi';
import { ProjectData, ProjectResponse } from '@/strapi/StrapiData';
import styles from './ProjectGrid.module.css';

export enum FilterType {
    All = 'all',
    Interactive = 'interactive',
    Static = 'static',
    Engineering = 'engineering'
}

interface ProjectGridProps {
    activeFilter: FilterType;
}

export default function ProjectGrid({ activeFilter }: ProjectGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isotopeInstance, setIsotopeInstance] = useState<any>(null);

  // Watch for filter changes and apply them to isotope
  useEffect(() => {
    if (isotopeInstance) {
      const filterValue = activeFilter === FilterType.All ? '*' : `.${activeFilter}`;
      isotopeInstance.arrange({ filter: filterValue });
    }
  }, [activeFilter, isotopeInstance]);

  // Load projects from Strapi
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response: ProjectResponse = await getProjects();
        console.log('Projects response:', response);
        setProjects(response.data);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };

    loadProjects();
  }, []);

  // Initialize Isotope after projects are loaded
  useEffect(() => {
    let iso: any = null;

    const initIsotope = async () => {
      if (gridRef.current && projects.length > 0) {
        const Isotope = (await import('isotope-layout')).default;
        iso = new Isotope(gridRef.current, {
          itemSelector: `.${styles.gridItem}`,
          masonry: {
            columnWidth: `.${styles.gridSizer}`,
            gutter: 20
          },
          layoutMode: 'masonry'
        });
        
        setIsotopeInstance(iso);
      }
    };

    if (typeof window !== 'undefined') {
      initIsotope();
    }

    return () => {
      if (iso) {
        iso.destroy();
      }
    };
  }, [projects]);

  return (
    <div>
      <div ref={gridRef} className={styles.grid}>
        <div className={styles.gridSizer}></div>
        
        {projects.map((project) => {
          const imageUrl = project.Thumbnail ? 
            `${STRAPI_URL}${project.Thumbnail.url}` : null;

          return (
            <div 
              key={project.id} 
              className={`${styles.gridItem} ${project.Type?.toLowerCase()}`}
            >
              <div className={styles.imageContainer}>
                {project.Thumbnail ? (
                  <img
                    src={imageUrl!}
                    alt={project.Title}
                    loading="lazy"
                    onLoad={() => isotopeInstance?.layout()}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
