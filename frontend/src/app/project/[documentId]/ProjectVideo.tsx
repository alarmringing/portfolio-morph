'use client'

import { useState, useEffect, useCallback } from 'react';
import styles from './ProjectPage.module.css';

interface ProjectVideoProps {
  type: 'Youtube' | 'Vimeo';
  url: string;
  title: string;
}

export default function ProjectVideo({ type, url, title }: ProjectVideoProps) {
  const [aspectRatio, setAspectRatio] = useState<string>('16/9'); // default fallback

  const getVideoUrl = useCallback(() => {
    if (type === 'Youtube') {
      // Extract video ID handling both standard and other YouTube URL formats
      const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]{11})/)?.[1];
      if (!videoId) return url; // fallback to original url if parsing fails
      return `https://www.youtube.com/embed/${videoId}`;
    } else {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
  }, [type, url]);

  const getVideoId = useCallback(() => {
    if (type === 'Youtube') {
      return url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]{11})/)?.[1];
    } else {
      return url.split('/').pop();
    }
  }, [type, url]);

  useEffect(() => {
    const fetchVideoMetadata = async () => {
      const videoId = getVideoId();
      if (!videoId) return;

      try {
        if (type === 'Vimeo') {
          const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`);
          const data = await response.json();
          if (data && data[0]) {
            const { width, height } = data[0];
            setAspectRatio(`${width}/${height}`);
          }
        } else if (type === 'Youtube') {
          // YouTube doesn't provide a simple API for video metadata without API key
          // Keeping 16/9 as default for YouTube videos
          setAspectRatio('16/9');
        }
      } catch (error) {
        console.error('Error fetching video metadata:', error);
        // Keep default aspect ratio on error
      }
    };

    fetchVideoMetadata();
  }, [type, getVideoId]);

  return (
    <div 
      className={styles.videoContainer}
      style={{ aspectRatio }}
    >
      <iframe
        src={getVideoUrl()}
        title={`${title} - ${type}`}
        frameBorder="0"
        allow={type === 'Youtube' 
          ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          : "autoplay; fullscreen; picture-in-picture"
        }
        allowFullScreen
      ></iframe>
    </div>
  );
} 