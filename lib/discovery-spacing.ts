/**
 * Discovery Spacing Configuration
 * Feature: product-discovery-threshold
 * Enforces Visual System constraints for curated grid experience
 */

export interface SpacingConfig {
  gridGap: string; // gap between cards
  cardPadding: string; // internal card padding
  containerPadding: string; // grid container padding
  minWhitespace: string; // minimum space between elements
}

/**
 * DISCOVERY_SPACING - Spatial Brutalism Constants
 * Generous whitespace is non-negotiable
 */
export const DISCOVERY_SPACING: SpacingConfig = {
  gridGap: '2rem', // 32px - generous spacing between cards
  cardPadding: '1rem', // 16px - internal card padding
  containerPadding: '3rem', // 48px - container edges
  minWhitespace: '1.5rem', // 24px - minimum between elements
};

/**
 * Responsive breakpoints for grid columns
 * 4 → 3 → 2 → 1 column reduction
 */
export const GRID_BREAKPOINTS = {
  mobile: 640, // < 640px: 1 column
  tablet: 1024, // 640-1024px: 2-3 columns
  desktop: 1024, // > 1024px: 4 columns
} as const;

/**
 * Density constraints - The Threshold
 * Maximum 4 monuments per row, 5-7 items per viewport
 */
export const DENSITY_CONSTRAINTS = {
  maxItemsPerRow: 4,
  minViewportItems: 5,
  maxViewportItems: 7,
  minViewportItemsFallback: 3, // For very small viewports
} as const;
