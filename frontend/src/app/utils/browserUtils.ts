// Check if running in a browser environment before accessing navigator
export const IS_WEBKIT = typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.platform || '') || // Check for iOS platforms
  (navigator.userAgent.includes('Safari') && !/Chrome|CriOS|FxiOS|EdgiOS|Chromium/.test(navigator.userAgent))); // Check for Safari on non-iOS 