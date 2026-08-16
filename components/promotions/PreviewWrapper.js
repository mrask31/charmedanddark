import { getPreviewPromotion, isPreviewMode } from "@/lib/promotions/preview";
import { computePromotionPrice } from "@/lib/promotions/engine";
import { PreviewBanner } from "./PreviewBanner";
import { PreviewPanel } from "./PreviewPanel";

/**
 * PreviewWrapper — Server component that detects preview mode and renders
 * the preview banner + side-by-side pricing panel.
 *
 * Include this in any page that should support preview mode.
 * When not in preview mode, renders nothing (zero overhead).
 *
 * Props:
 *   searchParams: Next.js page searchParams
 *   products: Array of product objects visible on the current page (for pricing table)
 */
export async function PreviewWrapper({ searchParams, products = [] }) {
  const params = await searchParams;
  if (!isPreviewMode(params)) return null;

  const promotion = await getPreviewPromotion(params);
  if (!promotion) return null;

  // Compute pricing for all visible products
  const pricingData = products
    .filter((p) => p && p.price)
    .map((p) => {
      const pricing = computePromotionPrice(p.price, promotion, p.id);
      if (!pricing) return null;
      return {
        name: p.name || p.title || 'Unknown',
        basePrice: pricing.basePrice,
        salePrice: pricing.displayPrice,
        savings: pricing.savings,
        percentage: pricing.percentage,
        badge: pricing.badgeText,
      };
    })
    .filter(Boolean);

  return (
    <>
      <PreviewBanner
        promotionName={promotion.name}
        promotionStatus={promotion.status}
      />
      <PreviewPanel
        promotion={promotion}
        products={pricingData}
      />
    </>
  );
}
