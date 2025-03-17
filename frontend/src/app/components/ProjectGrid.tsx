'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import { STRAPI_URL } from '@/strapi/strapi';
import styles from './ProjectGrid.module.css';
import { useProjects } from '../context/ProjectsContext';

export enum FilterType {
    All = 'all',
    Interactive = 'interactive',
    Static = 'static',
    Rnd = 'rnd',
    Music = 'music',
}

interface ProjectGridProps {
    onGridClick: (documentId: string) => void;
}

export default function ProjectGrid({ onGridClick }: ProjectGridProps) {
  const isotope = useRef<any>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { projects, isLoading, hasMore, loadMore, activeFilter } = useProjects();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

    // Inside your component
  const [expandedItemPosition, setExpandedItemPosition] = useState<'left' | 'right' | 'center' | null>(null);

  // Add this function to determine position
  const determinePosition = useCallback((element: HTMLElement) => {
    if (!element || !gridRef.current) return null;
    
    const gridRect = gridRef.current.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    // Calculate the element's center position relative to the grid
    const elementCenterX = elementRect.right;
    const gridWidth = gridRect.width;
    
    // Determine position based on where the center of the element is
    if (elementCenterX < gridWidth * 0.5) {
      return 'left';
    } else if (elementCenterX > gridWidth * 0.5) {
      return 'right';
    } else {
      return 'center';
    }
  }, []);

  // Handle project click based on available content
  const handleProjectClick = (project: any, gridRef: HTMLElement) => {
    // Case 1: If there is a description, navigate to project page
    if (project.Description) {
      onGridClick(project.documentId);
      return;
    }
    
    // Case 2: If there are external links, open the first available one
    if (project.Youtube) {
      window.open(project.Youtube, '_blank');
      return;
    }
    
    if (project.Vimeo) {
      window.open(project.Vimeo, '_blank');
      return;
    }
    
    if (project.Github) {
      window.open(project.Github, '_blank');
      return;
    }
    
    // Case 3: If there is neither description nor URLs, expand the item
    if (gridRef) {
      const position = determinePosition(gridRef);
      setExpandedItemPosition(position);
    }
    if (expandedItemId === project.documentId) {
      // If already expanded, collapse it
      setExpandedItemId(null);
    } else {
      // Expand this item
      setExpandedItemId(project.documentId);
    }
    
  };

  // Initialize Isotope after component mounts and projects are loaded
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !projects.length) return;

    let isotopeInstance: any = null;

    const initIsotope = async () => {
      if (typeof window !== 'undefined') {
        const [Isotope, imagesLoaded] = await Promise.all([
          import('isotope-layout'),
          import('imagesloaded'),
        ]);

        isotopeInstance = new Isotope.default(grid, {
          itemSelector: `.${styles.gridItem}`,
          layoutMode: 'masonry',
          masonry: {
            columnWidth: `.${styles.gridItem}`,
            horizontalOrder: false,
            gutter: 30,
          },
          stagger: 20,
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

   // Setup Intersection Observer for infinite scroll
   useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadMoreItems = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    };

    observerRef.current = new IntersectionObserver(loadMoreItems, {
      root: null,
      rootMargin: '200px', // Start loading before reaching the end
      threshold: 0.1
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, isLoading]);

   // Observe the last grid item
   useEffect(() => {
    if (!observerRef.current || projects.length === 0) return;

    const lastGridItem = gridRef.current?.lastElementChild as HTMLElement;
    if (lastGridItem) {
      observerRef.current.observe(lastGridItem);
    }

    return () => {
      if (lastGridItem && observerRef.current) {
        observerRef.current.unobserve(lastGridItem);
      }
    };
  }, [projects]);

  // Handle filter changes
  useEffect(() => {
    if (!isotope.current) return;

    const sanitizeSelector = (selector: string): string => {
      // Replace problematic characters with escaped versions
      return selector.toLowerCase()
        .replace(/&/g, 'and')        // Replace & with 'and'
        .replace(/[^a-z0-9-_]/g, '') // Remove any other special characters
        .trim();
    };
    
    
    const filterValue = activeFilter === FilterType.All ? '*' : `.${sanitizeSelector(activeFilter)}`;
    console.log(filterValue);
    isotope.current.arrange({ filter: filterValue });
  }, [activeFilter]);

  return (
    <div>
      <div ref={gridRef} className={styles.grid}>
        {isLoading && <div style={{textAlign: 'center'}}>Loading projects...</div>}
        <div className={styles.gridSizer}></div>
        
        {projects.map((project) => {
          const imageUrl = project.Thumbnail ? 
            `${STRAPI_URL}${project.Thumbnail.url}` : null;
          return (
            <button 
              key={project.documentId} 
              className={`
                ${styles.gridItem} 
                ${project.Type?.toLowerCase()} 
                ${expandedItemId === project.documentId ? styles.expanded : ''} 
                ${expandedItemId === project.documentId && expandedItemPosition === 'left' ? styles.expandedLeft : ''}
                ${expandedItemId === project.documentId && expandedItemPosition === 'right' ? styles.expandedRight : ''}
                ${expandedItemId === project.documentId && expandedItemPosition === 'center' ? styles.expandedCenter : ''}
              `}
              onClick={(e) => handleProjectClick(project, e.currentTarget)}
            >
              <div className={styles.gridItemInnerContainer}>
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
              <div className={styles.textContainer} >
                <h3>{project.Title}</h3>
                {project.Type && activeFilter == FilterType.All && (
                  <p>{project.Type == FilterType.Rnd ? 'R&D' : project.Type}</p>
                )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
