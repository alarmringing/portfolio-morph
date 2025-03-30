'use client'

import { useEffect, useRef, useCallback, ReactNode, RefObject } from 'react';
import styles from './IsotopeGrid.module.css';

interface IsotopeGridProps {
  children: ReactNode;
  projects: any[];
  itemSelector: string;
  filter: string | undefined;
}

export interface IsotopeRefType {
  arrange: (options: any) => void;
  layout: () => void;
  destroy: () => void;
}

export function generateRandomLayout(id: string | number, customFactor: number = 1) {
  // Use the id to seed the random number generator
  const idString = id.toString();
  const seed = idString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Generate two different random values from the same seed
  const random1 = ((seed % 100) / 100); // For margin-bottom
  const random2 = (((seed * 31) % 100) / 100); // For padding-left (using a different formula)
  
  // Scale to appropriate ranges
  const marginBottom = 2 + (random1 * 3 * customFactor); // 2-5 rem
  const paddingRight = 1 + (random2 * 2 * customFactor); // 1-3 rem
  
  return {
    marginBottom,
    paddingRight
  };
}

// This function accepts either a direct HTMLElement reference or a React RefObject
export function determineExpandPosition(
  element: HTMLElement, 
  gridContainer: HTMLElement | RefObject<HTMLDivElement | null>
): 'left' | 'right' {
  // If we have a RefObject, use its current property
  const grid = 'current' in gridContainer ? gridContainer.current : gridContainer;
  
  if (!element || !grid) return 'right';
  
  const gridRect = grid.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  if (elementRect.left < gridRect.left + elementRect.width) {
    return 'left';
  }

  return 'right';
}

export default function IsotopeGrid({ 
  children,
  projects, 
  itemSelector,
  filter
}: IsotopeGridProps) {
  const isotope = useRef<IsotopeRefType | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Initialize Isotope when the component mounts and when items change
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    let isotopeInstance: IsotopeRefType | null = null;

    const initIsotope = async () => {
      if (typeof window !== 'undefined') {
        const [Isotope, imagesLoaded] = await Promise.all([
          import('isotope-layout'),
          import('imagesloaded'),
        ]);

        isotopeInstance = new Isotope.default(grid, {
          itemSelector: itemSelector,
          layoutMode: 'masonry',
          masonry: {
            columnWidth: itemSelector,
            horizontalOrder: false,
            gutter: 0,
          },
          stagger: 0,
          originLeft: false,
          transitionDuration: '0.8s',
          hiddenStyle: {
            opacity: 0
          },
          visibleStyle: {
            opacity: 1
          }
        });

        // // Load images and update layout
        // imagesLoaded.default(grid).on('progress', () => {
        //   if (isotopeInstance) {
        //     isotopeInstance.layout();
        //   }
        // });

        imagesLoaded.default(grid).on('done', () => {
            if (isotopeInstance) {
              isotopeInstance.layout();
            }
          });

        isotope.current = isotopeInstance;
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
  }, [itemSelector, projects]);

  // Handle filter changes
  useEffect(() => {
    if (!isotope.current || !filter) return;
    
    isotope.current.arrange({ filter });
  }, [filter]);

  // Layout method available to parent components
  const relayout = useCallback(() => {
    if (isotope.current) {
      isotope.current.layout();
    }
  }, []);

  return (
    <div className={styles.grid} ref={gridRef}>
      <div className={styles.gridSizer}></div>
      {children}
    </div>
  );
} 