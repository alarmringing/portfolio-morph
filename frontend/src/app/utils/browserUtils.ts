// Check if running in a browser environment before accessing navigator
export const IS_SAFARI = typeof navigator !== 'undefined' && 
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent); 