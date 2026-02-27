/**
 * Density Controller - Viewport capacity calculation
 * Feature: product-discovery-threshold
 * Enforces 5-7 products per viewport with graceful degradation
 */

import { SpacingConfig, DENSITY_CONSTRAINTS } from './discovery-spacing';

export interface DensityCalculation {
  viewportHeight: number;
  itemHeight: number; // estimated card height
  rowGap: number; // spacing between rows
  itemsPerRow: number; // current responsive column count
  recommendedCount: number; // 5-7 range (or 3-7 for small viewports)
}

/**
 * Calculate how many products should be displayed based on viewport dimensions
 * 
 * Algorithm:
 * 1. Measure viewport height
 * 2. Calculate estimated card height (4:5 aspect ratio + metadata)
 * 3. Determine how many complete rows fit in viewport
 * 4. Multiply rows × itemsPerRow
 * 5. Clamp result to 5-7 range (or 3-7 for very small viewports)
 * 6. Return recommended product count
 */
export function calculateDensity(
  viewportHeight: number,
  itemsPerRow: number,
  spacing: SpacingConfig
): DensityCalculation {
  // Parse spacing values (convert rem to px, assuming 16px base)
  const gridGapPx = parseFloat(spacing.gridGap) * 16;
  const containerPaddingPx = parseFloat(spacing.containerPadding) * 16;
  
  // Estimate card height based on 4:5 aspect ratio
  // Assuming card width is roughly viewport width / itemsPerRow
  // For simplicity, use a fixed estimate: 400px width → 500px image + 80px metadata
  const estimatedCardHeight = 580; // 500px image (4:5 ratio) + 80px metadata
  
  // Calculate available height for products
  const availableHeight = viewportHeight - (containerPaddingPx * 2);
  
  // Calculate how many rows fit
  const rowsWithGaps = availableHeight / (estimatedCardHeight + gridGapPx);
  const completeRows = Math.floor(rowsWithGaps);
  
  // Calculate total items
  let recommendedCount = completeRows * itemsPerRow;
  
  // Clamp to density constraints
  const { minViewportItems, maxViewportItems, minViewportItemsFallback } = DENSITY_CONSTRAINTS;
  
  // For very small viewports, relax constraint to minimum 3
  if (recommendedCount < minViewportItemsFallback) {
    recommendedCount = minViewportItemsFallback;
  } else if (recommendedCount < minViewportItems) {
    recommendedCount = minViewportItems;
  } else if (recommendedCount > maxViewportItems) {
    recommendedCount = maxViewportItems;
  }
  
  return {
    viewportHeight,
    itemHeight: estimatedCardHeight,
    rowGap: gridGapPx,
    itemsPerRow,
    recommendedCount,
  };
}

/**
 * Determine responsive column count based on viewport width
 * 4 → 3 → 2 → 1 column reduction
 */
export function getResponsiveColumns(viewportWidth: number): number {
  if (viewportWidth < 640) return 1; // Mobile
  if (viewportWidth < 768) return 2; // Small tablet
  if (viewportWidth < 1024) return 3; // Large tablet
  return 4; // Desktop - maximum 4 per row (Spatial Brutalism)
}
