'use client'

import { useRef, useEffect, useState } from 'react'
import styles from './TextMorphEffect.module.css'
import { GlyphType, isCJKGlyph } from '../utils/textUtils';
import { useMouseReactiveStyles } from '../hooks/useMouseReactiveStyles';
import { IS_SAFARI } from '../utils/browserUtils';

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
  
  // Normalize texts to ensure font is set
  const normalizedTexts = texts.map(item => ({
    ...item,
    font: item.font || defaultFont
  }));
  
  useEffect(() => {
    if (normalizedTexts.length < 2) return; // Need at least 2 texts to morph
    
    let animationId: number | null = null;

    function verticalTextStyle(glyphType: GlyphType): TextStyleProps {
      let style: TextStyleProps = { writingMode: 'horizontal-tb', letterSpacing: '0px', top: '0'};
      if (isPortrait) {
        style = {...style, writingMode: 'vertical-rl' };
        if (glyphType === GlyphType.L) {
          style = {...style, textOrientation: 'sideways'};
        } else {
          style = {...style, textOrientation: 'upright'};
        }
        if (glyphType === GlyphType.K) {
          // korean vertical letter spacing should only be applied on non- safari browsers
          // Check isClient to prevent hydration mismatch
          const reduceVerticalSpacing =  IS_SAFARI ? { letterSpacing: '0px', top: '0px' } : { letterSpacing: '-0.4em', top: '-0.2em' };
          style = {
            ...style, 
            ...reduceVerticalSpacing
          };
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
      text1Ref.current.style.opacity = `${Math.pow(progress, 0.4)}`;

      progress = 1 - progress;
      text0Ref.current.style.filter = `blur(${Math.min(8 / progress - 8, 100)}px)`;
      text0Ref.current.style.opacity = `${Math.pow(progress, 0.4)}`;
    }

    function doCooldown() {
      if (!text0Ref.current || !text1Ref.current) return;

      animationState.current.morph = 0;

      text0Ref.current.style.filter = "";
      text0Ref.current.style.opacity = "1";
      text1Ref.current.style.filter = "";
      text1Ref.current.style.opacity = "0";

      const currentText = normalizedTexts[animationState.current.textIndex % normalizedTexts.length];
      const nextText = normalizedTexts[(animationState.current.textIndex + 1) % normalizedTexts.length];
      applyTextStyles(currentText, nextText);
    }

    function animate() {
      if (!document.body.contains(text0Ref.current)) {
        if (animationId) cancelAnimationFrame(animationId);
        return;
      }
      
      const newTime = new Date();
      const dt = (newTime.getTime() - animationState.current.time.getTime()) / 1000;
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
  }, [normalizedTexts, morphTime, cooldownTime, isPortrait, defaultFont, width]);

  // Use the custom hook for mouse reactivity
  useMouseReactiveStyles(containerRef);
    
  // Create a style object for the container with dynamic sizing AND hardware acceleration
  const fontSizeStyle = isPortrait
    ? { fontSize: `${width / 3}vh` } // In portrait, use height percentage
    : { fontSize: `${width / 2}vw` };  // In landscape, use width percentage

  const containerStyle = {
    ...fontSizeStyle,
    // Consider adding will-change: filter; if transform alone isn't enough
  };
    
  return (
    <div>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="threshold">
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 1"/> 
              {/* Values below ~0.5 alpha become 0, above become 1 */}
            </feComponentTransfer>
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