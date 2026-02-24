/** Matches Tailwind v4 default breakpoints. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/** Pre-built media query strings for JS matchMedia / inline styles. */
export const MEDIA_QUERIES = {
  mdDown: `(max-width: ${BREAKPOINTS.md}px)`,
  xlUp: `(min-width: ${BREAKPOINTS.xl}px)`,
} as const;
