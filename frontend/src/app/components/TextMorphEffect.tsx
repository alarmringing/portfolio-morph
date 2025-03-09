import { useRef, useEffect } from 'react'
import styles from './TextMorphEffect.module.css'
import { isCJKText, classifyGlyph, GlyphType, isCJKGlyph } from '../utils/textUtils';

// Define a type for text items with font information
interface TextItem {
  text: string;
  font?: string;
}

interface TextMorphEffectProps {
  texts: (string | TextItem)[];  // Can accept strings or TextItem objects
  className?: string;
  morphTime?: number;
  cooldownTime?: number;
  width?: number; // Width as percentage of screen width
  defaultFont?: string; // Default font to use when not specified
  isPortrait?: boolean; // Whether the device is in portrait mode
}

export default function TextMorphEffect({ 
  texts, 
  className = '',
  morphTime = 2,
  cooldownTime = 0.1,
  width = 80, // Default to 80% of screen width
  defaultFont = 'NotoSerifCJK, serif', // Default font
  isPortrait = false // Default to landscape mode
}: TextMorphEffectProps) {
  const text0Ref = useRef<HTMLSpanElement>(null);
  const text1Ref = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Normalize texts to TextItem objects
  const normalizedTexts = texts.map(item => 
    typeof item === 'string' ? { text: item, font: defaultFont } : { ...item, font: item.font || defaultFont }
  );
  
  useEffect(() => {
    if (normalizedTexts.length < 2) return; // Need at least 2 texts to morph
    
    let textIndex = 0;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;
    let animationId: number | null = null;

    function verticalTextStyle(glyphType: GlyphType) {
      var style = { writingMode: 'horizontal-tb', letterSpacing: '0px' }
      if (isPortrait) {
        style = {...style, writingMode: 'vertical-rl' }
        if (glyphType === GlyphType.L) {
          style =  {...style, textOrientation: 'sideways'};
        } else {
          style =  {...style , textOrientation: 'upright'};
        }
        if (glyphType === GlyphType.K) {
          style = {...style, letterSpacing: '-0.4em'};
        }
      }
      return style;
    }

    // Function to apply text styles
    function applyTextStyles(currentText: TextItem, nextText: TextItem) {
      if (!text0Ref.current || !text1Ref.current) return;
      
      // Set text content and font
      text0Ref.current.textContent = currentText.text;
      text0Ref.current.style.fontFamily = currentText.font || defaultFont;
      
      text1Ref.current.textContent = nextText.text;
      text1Ref.current.style.fontFamily = nextText.font || defaultFont;
      
      // Apply vertical text styles
      const text0Glyph = classifyGlyph(currentText.text);
      const text1Glyph = classifyGlyph(nextText.text);

      // For dynamic sizing, use the container's font size to fill the width
      const baseFontSize = (isPortrait: boolean, textGlyph: GlyphType) => {
        return isPortrait
          ? { fontSize: `${width / 3 * (isCJKGlyph(textGlyph) ? 1.3 : 1)}vh` } // In portrait, use height percentage
          : { fontSize: `${width / 2.6 * (isCJKGlyph(textGlyph) ? 1.3 : 1)}vw` };  // In landscape, use width percentage
      }

      const text0Style = {...verticalTextStyle(text0Glyph), ...baseFontSize(isPortrait, text0Glyph)};
      const text1Style = {...verticalTextStyle(text1Glyph), ...baseFontSize(isPortrait, text1Glyph)};

      if (text0Style) {
        Object.assign(text0Ref.current.style, text0Style);
      }
      if (text1Style) {
        Object.assign(text1Ref.current.style, text1Style);
      }
    }

    // Set initial text content
    if (text0Ref.current && text1Ref.current) {
      const currentText = normalizedTexts[textIndex % normalizedTexts.length];
      const nextText = normalizedTexts[(textIndex + 1) % normalizedTexts.length];
      applyTextStyles(currentText, nextText);
    } 

    function doMorph() {
      if (!text0Ref.current || !text1Ref.current) return;
      morph -= cooldown;
      cooldown = 0;
      let progress = morph / morphTime;
      
      if (progress > 1) {
        // This marks the end of the morph
        cooldown = cooldownTime;
        progress = 1;
        // Now update the text content
        textIndex++;
      }
      
      setMorph(progress);
    }

    function setMorph(progress: number) {
      if (!text0Ref.current || !text1Ref.current) return;
    
      // Apply visual effects - using transform and opacity for better performance
      text1Ref.current.style.filter = `blur(${Math.min(8 / progress - 8, 100)}px)`;
      text1Ref.current.style.opacity = `${Math.pow(progress, 0.4) * 100}%`;
      
      progress = 1 - progress;
      text0Ref.current.style.filter = `blur(${Math.min(8 / progress - 8, 100)}px)`;
      text0Ref.current.style.opacity = `${Math.pow(progress, 0.4) * 100}%`;
    }

    function doCooldown() {
      if (!text0Ref.current || !text1Ref.current) return;
      
      morph = 0;

      // Apply styles
      text0Ref.current.style.filter = "";
      text0Ref.current.style.opacity = "100%";
      text1Ref.current.style.filter = "";
      text1Ref.current.style.opacity = "0%";

      const currentText = normalizedTexts[textIndex % normalizedTexts.length];
      const nextText = normalizedTexts[(textIndex + 1) % normalizedTexts.length];
      applyTextStyles(currentText, nextText);
    }

    function animate() {
      if (!document.body.contains(text0Ref.current)) {
        // Component has been unmounted or removed from DOM
        if (animationId) cancelAnimationFrame(animationId);
        return;
      }
      
      let newTime = new Date();
      let dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;
      
      cooldown -= dt;
      
      if (cooldown <= 0) {
        doMorph();
      } else {
        doCooldown();
      }
      
      // Request the next frame at the end of the function
      animationId = requestAnimationFrame(animate);
    }

    // Main body.
    // Start animation - only call requestAnimationFrame once to start the loop
    animationId = requestAnimationFrame(animate);
    
    // Cleanup on unmount
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [normalizedTexts, morphTime, cooldownTime, isPortrait, defaultFont]);
    
  // Create a style object for the container with dynamic sizing
  const containerStyle = isPortrait
    ? { fontSize: `${width / 3}vh` } // In portrait, use height percentage
    : { fontSize: `${width / 2}vw` };  // In landscape, use width percentage
    
  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${className}`} 
      style={containerStyle}
    >
      <span ref={text0Ref} className={styles.text}></span>
      <span ref={text1Ref} className={styles.text}></span>
    </div>
  );
}