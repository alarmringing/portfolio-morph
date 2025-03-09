export enum GlyphType {
  C = 'C', // Chinese
  J = 'J', // Japanese
  K = 'K', // Korean
  L = 'L'  // Latin
}

export function classifyGlyph(char: string): GlyphType {
  const code = char.charCodeAt(0);
  
  // Chinese ranges
  if (code >= 0x4E00 && code <= 0x9FFF) {
    return GlyphType.C;
  }
  
  // Japanese ranges
  if ((code >= 0x3040 && code <= 0x309F) || // Hiragana
      (code >= 0x30A0 && code <= 0x30FF)) { // Katakana
    return GlyphType.J;
  }
  
  // Korean ranges
  if ((code >= 0x3130 && code <= 0x318F) || // Hangul Compatibility Jamo
      (code >= 0xAC00 && code <= 0xD7AF)) { // Hangul Syllables
    return GlyphType.K;
  }
  
  return GlyphType.L;
}

export function isCJKText(text: string): boolean {
  return text.split('').some(char => {
    const glyphType = classifyGlyph(char);
    return isCJKGlyph(glyphType);
  });
}

export function isCJKGlyph(glyphType: GlyphType): boolean {
  return glyphType === GlyphType.C || 
         glyphType === GlyphType.J || 
         glyphType === GlyphType.K;
}

export function getTextGlyphClass(text: string): string {
  return isCJKText(text) ? 'cjk-font' : 'latin-font';
}