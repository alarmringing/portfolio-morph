import { useRef, useEffect, useState } from 'react'
import styles from './TextMorphEffect.module.css'
import { isCJKText, classifyGlyph, GlyphType, isCJKGlyph } from '../utils/textUtils';
import gsap from 'gsap'; // Import GSAP

// Define a custom type for our style object that includes textOrientation
interface TextStyleProps {
  writingMode: string;
  letterSpacing: string;
  top: string;
  textOrientation?: string; // Make textOrientation optional
}

// Define a type for text items with font information
interface TextItem {
  text: string;
  font?: string;
  glyphType: GlyphType;  // Add GlyphType to the interface
}

interface TextMorphEffectProps {
  texts: TextItem[];  // Now only accepts TextItem objects with required glyphType
  className?: string;
  morphTime?: number;
  cooldownTime?: number;
  width?: number;
  defaultFont?: string;
  isPortrait?: boolean;
  threshold?: number;
  textColor?: string;
}

export default function TextMorphEffect({ 
  texts, 
  className = '',
  morphTime = 2,
  cooldownTime = 0.1,
  width = 80,
  textColor = 'var(--accent-color)',
  defaultFont = 'NotoSerifCJK, serif',
  isPortrait = false,
  threshold = -140,
}: TextMorphEffectProps) {
  const text0Ref = useRef<HTMLSpanElement>(null);
  const text1Ref = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationState = useRef({
    textIndex: 0,
    time: new Date(),
    morph: 0,
    cooldown: cooldownTime,
  });
  // Ref to hold the current smoothed mouse coordinates for GSAP animation
  // Initialize with 0,0 - will be set to center on client mount
  const smoothedMouseRef = useRef({ x: 0, y: 0 }); 
  
  // Normalize texts to ensure font is set
  const normalizedTexts = texts.map(item => ({
    ...item,
    font: item.font || defaultFont
  }));
  
  useEffect(() => {
    if (normalizedTexts.length < 2) return; // Need at least 2 texts to morph
    
    let animationId: number | null = null;

    function verticalTextStyle(glyphType: GlyphType): TextStyleProps {
      var style: TextStyleProps = { writingMode: 'horizontal-tb', letterSpacing: '0px', top: '0'};
      if (isPortrait) {
        style = {...style, writingMode: 'vertical-rl' };
        if (glyphType === GlyphType.L) {
          style = {...style, textOrientation: 'sideways'};
        } else {
          style = {...style, textOrientation: 'upright'};
        }
        if (glyphType === GlyphType.K) {
          style = {...style, letterSpacing: '-0.4em', top: '-0.2em'};
        }
      }
      return style;
    }

    // For dynamic sizing, use the container's font size to fill the width
    const baseFontSize = (isPortrait: boolean, glyphType: GlyphType) => {
      return {
        fontSize: isPortrait
          ? `${width / 3 * (isCJKGlyph(glyphType) ? 1.3 : 1.1)}vh` // In portrait, use height percentage
          : `${width / 2.6 * (isCJKGlyph(glyphType) ? 1.3 : 1.1)}vw`  // In landscape, use width percentage
      };
    };

    // Function to apply text styles
    function applyTextStyles(currentText: TextItem, nextText: TextItem) {
      if (!text0Ref.current || !text1Ref.current) return;
      
      // Set text content and font
      text0Ref.current.textContent = currentText.text;
      text0Ref.current.style.fontFamily = currentText.font || defaultFont;
      
      text1Ref.current.textContent = nextText.text;
      text1Ref.current.style.fontFamily = nextText.font || defaultFont;
      
      // Apply vertical text styles using the provided glyphType
      const text0Style = {...verticalTextStyle(currentText.glyphType), ...baseFontSize(isPortrait, currentText.glyphType)};
      const text1Style = {...verticalTextStyle(nextText.glyphType), ...baseFontSize(isPortrait, nextText.glyphType)};

      if (text0Style) {
        Object.assign(text0Ref.current.style, text0Style);
      }
      if (text1Style) {
        Object.assign(text1Ref.current.style, text1Style);
      }
    }

    function doMorph() {
      if (!text0Ref.current || !text1Ref.current) return;
      animationState.current.morph -= animationState.current.cooldown;
      animationState.current.cooldown = 0;
      let progress = animationState.current.morph / morphTime;
      
      if (progress > 1) {
        animationState.current.cooldown = cooldownTime;
        progress = 1;
        animationState.current.textIndex++;
      }
      
      setMorph(progress);
    }

    function setMorph(progress: number) {
      if (!text0Ref.current || !text1Ref.current) return;
    
      text1Ref.current.style.filter = `blur(${Math.min(8 / progress - 8, 100)}px)`;
      text1Ref.current.style.opacity = `${Math.pow(progress, 0.4) * 100}%`;
      
      progress = 1 - progress;
      text0Ref.current.style.filter = `blur(${Math.min(8 / progress - 8, 100)}px)`;
      text0Ref.current.style.opacity = `${Math.pow(progress, 0.4) * 100}%`;
    }

    function doCooldown() {
      if (!text0Ref.current || !text1Ref.current) return;
      
      animationState.current.morph = 0;

      text0Ref.current.style.filter = "";
      text0Ref.current.style.opacity = "100%";
      text1Ref.current.style.filter = "";
      text1Ref.current.style.opacity = "0%";

      const currentText = normalizedTexts[animationState.current.textIndex % normalizedTexts.length];
      const nextText = normalizedTexts[(animationState.current.textIndex + 1) % normalizedTexts.length];
      applyTextStyles(currentText, nextText);
    }

    function animate() {
      if (!document.body.contains(text0Ref.current)) {
        if (animationId) cancelAnimationFrame(animationId);
        return;
      }
      
      let newTime = new Date();
      let dt = (newTime.getTime() - animationState.current.time.getTime()) / 1000;
      animationState.current.time = newTime;
      
      animationState.current.cooldown -= dt;
      
      if (animationState.current.cooldown <= 0) {
        doMorph();
      } else {
        doCooldown();
      }
      
      animationId = requestAnimationFrame(animate);
    }

    // Set initial text content
    const currentText = normalizedTexts[animationState.current.textIndex % normalizedTexts.length];
    const nextText = normalizedTexts[(animationState.current.textIndex + 1) % normalizedTexts.length];
    if (text0Ref.current && text1Ref.current) {
      applyTextStyles(currentText, nextText);
    }

    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [normalizedTexts, morphTime, cooldownTime, isPortrait, defaultFont]);

  // Effect to set initial mouse position and handle movement/shadow animation
  useEffect(() => {
    // Set initial position to center only on the client
    smoothedMouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const animationTarget = smoothedMouseRef.current; // GSAP will tween the x/y properties

    const updateShadowProperties = () => {
      if (!containerRef.current) return;

      // Calculate everything based on the current smoothed mouse position
      const { x: smoothedX, y: smoothedY } = animationTarget; 
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = smoothedX - centerX;
      const deltaY = smoothedY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDist = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
      var normalizedDistance = maxDist === 0 ? 0 : Math.min(distance / maxDist, 1);
      normalizedDistance = Math.pow(normalizedDistance, 2); // Apply curve

      // Calculate blur radius based on smoothed distance
      const maxBlur = 5;
      const blurRadius = maxBlur * normalizedDistance;

      const maxOffsetIncrease = 15;

      // Calculate offset magnitudes based on smoothed distance
      const baseOffsetX = 2;
      const totalOffsetXMagnitude = baseOffsetX + maxOffsetIncrease * normalizedDistance;
      const baseOffsetY = 3;
      const totalOffsetYMagnitude = baseOffsetY + maxOffsetIncrease * normalizedDistance;

      let finalOffsetX = totalOffsetXMagnitude; // Default direction at center
      let finalOffsetY = totalOffsetYMagnitude;

      if (distance > 0.1) { // Use direction if not at center
          const normDirectionX = -deltaX / distance;
          const normDirectionY = -deltaY / distance;
          finalOffsetX = totalOffsetXMagnitude * normDirectionX;
          finalOffsetY = totalOffsetYMagnitude * normDirectionY;
      }

      // Update CSS variables directly
      containerRef.current.style.setProperty('--text-shadow-blur-radius', `${blurRadius}px`);
      containerRef.current.style.setProperty('--text-shadow-offset-x', `${finalOffsetX}px`);
      containerRef.current.style.setProperty('--text-shadow-offset-y', `${finalOffsetY}px`);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      // No need to setMousePosition state if not used elsewhere

      // Animate the smoothed mouse position values
      gsap.to(animationTarget, {
        x: mouseX, // Target raw mouse X
        y: mouseY, // Target raw mouse Y
        duration: 0.8, // Adjust duration for desired smoothness
        ease: 'power1.out', 
        overwrite: 'auto',
        onUpdate: updateShadowProperties // Call the update function on each frame
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initialize shadow on mount based on initial smoothed position
    updateShadowProperties(); 

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      // Kill GSAP tweens targeting this object on cleanup
      gsap.killTweensOf(animationTarget);
      // Optionally reset CSS variables
      if (containerRef.current) {
         containerRef.current.style.removeProperty('--text-shadow-blur-radius');
         containerRef.current.style.removeProperty('--text-shadow-offset-x');
         containerRef.current.style.removeProperty('--text-shadow-offset-y');
      }
    };
  }, []); // Empty dependency array means run once on mount
    
  // Create a style object for the container with dynamic sizing
  const containerStyle = isPortrait
    ? { fontSize: `${width / 3}vh` } // In portrait, use height percentage
    : { fontSize: `${width / 2}vw` };  // In landscape, use width percentage
    
  return (
    <div>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values={`1 0 0 0 0
                     0 1 0 0 0
                     0 0 1 0 0
                     0 0 0 255 ${threshold}`}
            />
          </filter>
        </defs>
      </svg>

      <div 
        ref={containerRef}
        className={`${styles.container} ${className}`} 
        style={containerStyle}
      >
          <span ref={text0Ref} className={styles.text} style={{ color: textColor }}></span>
          <span ref={text1Ref} className={styles.text} style={{ color: textColor }}></span>
      </div>
    </div>
  );
}