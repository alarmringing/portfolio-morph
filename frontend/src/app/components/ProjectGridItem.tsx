'use client'

import Image from 'next/image';
import { STRAPI_URL } from '@/strapi/strapi';
import styles from './IsotopeGrid.module.css';
import { FilterType } from '../context/ProjectsContext';
import { ProjectData } from '@/strapi/StrapiData';

interface ProjectGridItemProps {
  project: ProjectData;
  marginBottom: number;
  paddingRight: number;
  showType: boolean;
  isExpanded: boolean;
  expandedPosition: 'left' | 'right' | 'center' | null;
  onClick: (element: HTMLButtonElement) => void;
}

export function ProjectGridItem({
  project,
  marginBottom,
  paddingRight,
  showType,
  isExpanded,
  expandedPosition,
  onClick
}: ProjectGridItemProps) {
  const imageUrl = project.Thumbnail 
    ? `${STRAPI_URL}${project.Thumbnail.url}` 
    : null;

  const isLandscape = project.Thumbnail && project.Thumbnail.width > project.Thumbnail.height && project.Type !== FilterType.None;

  return (
    <button 
      style={{ marginBottom: `${marginBottom}rem`, paddingRight: `${paddingRight}rem` }}
      className={`
        ${styles.gridItem} 
        ${project.Type?.toLowerCase()} 
        ${isLandscape ? styles.landscape : styles.portrait}
        ${isExpanded ? styles.expanded : ''} 
        ${isExpanded && expandedPosition === 'left' ? styles.expandedLeft : ''}
        ${isExpanded && expandedPosition === 'right' ? styles.expandedRight : ''}
        ${isExpanded && expandedPosition === 'center' ? styles.expandedCenter : ''}
      `}
      onClick={(e) => onClick(e.currentTarget)}
    >
      <div className={styles.gridItemInnerContainer}>
        <div className={styles.imageContainer}>
          {imageUrl && project.Thumbnail ? (
            <Image
              src={imageUrl}
              alt={project.Title || 'Project thumbnail'}
              width={project.Thumbnail.width}
              height={project.Thumbnail.height}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div>No Image</div>
          )}
        </div>
        <div className={styles.textContainer}>
          <h3>{project.Title}</h3>
          {showType && (
            <p>{project.Type === FilterType.Rnd ? 'R&D' : project.Type}</p>
          )}
        </div>
      </div>
    </button>
  );
} 