// Firefox (and browsers built on it, such as LibreWolf or Waterfox) names
// itself "Firefox/<version>" in the user agent. Firefox on iOS runs on
// Safari's engine and says "FxiOS" instead, so it does not match.
export function isFirefox(): boolean {
  return /\bFirefox\//.test(navigator.userAgent);
}
