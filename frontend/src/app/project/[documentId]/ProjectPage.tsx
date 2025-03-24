'use client'

import { ProjectData } from '@/strapi/StrapiData';
import { STRAPI_URL } from '@/strapi/strapi';
import { renderNode } from '@/strapi/StrapiRenderNodes';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { fadeTransitionStyle, handlePageEnterTransition, handlePageExitTransition } from '../../utils/transitions';
import { splitDescription } from '../../utils/descriptionUtils';
import styles from './ProjectPage.module.css';
import gridStyles from '../../components/IsotopeGrid.module.css';
import ProjectMediaGrid from './ProjectMediaGrid';
import ProjectVideo from './ProjectVideo';

interface ProjectPageProps {
  project: ProjectData;
}

export default function ProjectPage({ project }: ProjectPageProps) {
  const router = useRouter();
  const [isEntering, setIsEntering] = useState(false);
  const imageUrl = project.Thumbnail ? 
    `${STRAPI_URL}${project.Thumbnail.url}` : null;
  const [primaryDescription, secondaryDescription] = splitDescription(project.Description);
  
  // Filter media by type
  const imageMedia = project.Media ? project.Media.filter(media => media.mime?.startsWith('image/')) : [];
  const nonImageMedia = project.Media ? project.Media.filter(media => !media.mime?.startsWith('image/')) : [];
  
  // Determine if we should show image grid
  const showImageGrid = imageMedia.length > 2;
  const regularImageMedia = !showImageGrid ? imageMedia : [];
  const gridImageMedia = showImageGrid ? imageMedia : [];
  
  useEffect(() => {
    handlePageEnterTransition(setIsEntering);
  }, []);

  const handleBack = () => {
    handlePageExitTransition(setIsEntering, () => {
      router.push('/#projects');
    });
  };

  // Function to render any media type
  const renderMedia = (media: any, index?: number, customClasses?: string) => {
    if (!media) return null;
    
    const containerClass = `${styles.mediaContainer} ${customClasses || ''}`;
    
    if (media.mime?.startsWith('image/')) {
      return (
        <div key={index} className={containerClass}>
          <img
            src={`${STRAPI_URL}${media.url}`}
            alt={media.alternativeText || project.Title}
            className={styles.mediaImage}
          />
          {media.caption && <p className={styles.mediaCaption}>{media.caption}</p>}
        </div>
      );
    } else if (media.mime?.startsWith('audio/')) {
      return (
        <div key={index} className={containerClass}>
          <audio controls className={styles.audioPlayer}>
            <source src={`${STRAPI_URL}${media.url}`} type={media.mime} />
            Your browser does not support the audio element.
          </audio>
          {media.caption && <p className={styles.mediaCaption}>{media.caption}</p>}
        </div>
      );
    } else if (media.mime === 'application/pdf') {
      return (
        <div key={index} className={`${containerClass} ${styles.aspectPdf}`}>
          <object 
            data={`${STRAPI_URL}${media.url}`}
            type="application/pdf"
            className={styles.iframe}
          >
            <p>Unable to display PDF. <a href={`${STRAPI_URL}${media.url}`} target="_blank" rel="noopener noreferrer">Download</a> instead.</p>
          </object>
          {media.caption && <p className={styles.mediaCaption}>{media.caption}</p>}
        </div>
      );
    }
    return null;
  };

  // Function to render the Hero section based on HeroType
  const renderHero = () => {
    switch (project.HeroType) {
      case 'Thumbnail':
        return renderMedia(project.Thumbnail, undefined);
      case 'Youtube':
        return project.Youtube ? (
          <ProjectVideo type="Youtube" url={project.Youtube} title={project.Title} />
        ) : null;
      case 'Vimeo':
        return project.Vimeo ? (
          <ProjectVideo type="Vimeo" url={project.Vimeo} title={project.Title} />
        ) : null;
      case 'HeroMedia':
        return renderMedia(project.HeroMedia, undefined);
      default:
        return null;
    }
  };

  return (
    <div className={styles.container} style={fadeTransitionStyle(isEntering)}>
      {/* Back button */}
      <div className={styles.backButton}>
        <button onClick={handleBack} className="">
          Back
        </button>
      </div>

      {/* Header section with Title, Year, Stack */}
      <header className={styles.header}>
        <h1 className={styles.title}>{project.Title}</h1>
        <div className={styles.metaInfo}>
          {project.Year && <div className={styles.metaInfoItem}>{project.Year}</div>}
          {project.Stack && <div className={styles.metaInfoItem}>{project.Stack}</div>}
          {project.Collaborators && <div className={styles.metaInfoItem}>Jihee Hwang, {project.Collaborators}</div>}
        </div>
      </header>

      {/* Hero section */}
      <div className={styles.heroSection}>
        {renderHero()}
      </div>

      {/* Content Area - Description and links */}
      <div className={styles.contentArea}>
        {/* Primary Description section */}
        {primaryDescription && (
          <section className={styles.descriptionPrimary}>
            <div className={styles.descriptionContent}>
              {primaryDescription.map((paragraph, index) => (
                <div key={index}>{renderNode(paragraph)}</div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Youtube, Vimeo, Iframe, Github links */}
      <section className={styles.embed}>
        {/* YouTube embed */}
        {project.Youtube && project.HeroType !== 'Youtube' && (
          <ProjectVideo type="Youtube" url={project.Youtube} title={project.Title} />
        )}

        {/* Vimeo embed */}
        {project.Vimeo && project.HeroType !== 'Vimeo' && (
          <ProjectVideo type="Vimeo" url={project.Vimeo} title={project.Title} />
        )}

        {/* Iframe embed */}
        {project.Iframe && (
          <div className={styles.aspectPdf}>
            <iframe
              className={styles.iframe}
              src={project.Iframe}
              title={`${project.Title} - External content`}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Github link */}
        {project.Github && (
          <div>
            <a 
              href={project.Github} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              Github
            </a>
          </div>
        )}
      </section>

      {/* Secondary Description (shown below the two-column layout) */}
      {secondaryDescription && (
        <section className={styles.descriptionSecondary}>
          <div className={styles.descriptionContent}>
            {secondaryDescription.map((paragraph, index) => (
              <div key={index}>{renderNode(paragraph)}</div>
            ))}
          </div>
        </section>
      )}

      {/* Non-image Media section */}
      {nonImageMedia.length > 0 && (
        <section className={styles.mediaSection}>
          <div className={styles.sectionWithSpacing}>
            {nonImageMedia.map((media, index) => renderMedia(media, index))}
          </div>
        </section>
      )}

      {/* Image Media section */}
      {imageMedia.length > 0 && (
        <section className={styles.mediaSection}>
          {/* Regular image rendering (for 1-2 image items) */}
          {!showImageGrid && (
            <div className={styles.sectionWithSpacing}>
              {regularImageMedia.map((media, index) => renderMedia(media, index))}
            </div>
          )}
          
          {/* Grid-based image rendering (for 3+ image items) */}
          {showImageGrid && (
            <ProjectMediaGrid project={project} media={gridImageMedia} />
          )}
        </section>
      )}
    </div>
  );
}
