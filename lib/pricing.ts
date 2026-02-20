/**
 * Pricing logic for Charmed & Dark
 * House Price: 10% off, rounded to nearest whole dollar
 */

export interface PricingDisplay {
  standard: number;
  house: number;
  formatted: {
    standard: string;
    house: string;
  };
}

/**
 * Calculate House Price from Standard Price
 * 10% discount, rounded to nearest whole dollar
 */
export function calculateHousePrice(standardPrice: number): number {
  const discounted = standardPrice * 0.9;
  return Math.round(discounted);
}

/**
 * Get pricing display for a product
 */
export function getPricingDisplay(standardPrice: number): PricingDisplay {
  const house = calculateHousePrice(standardPrice);
  
  return {
    standard: standardPrice,
    house,
    formatted: {
      standard: `$${standardPrice.toFixed(2)}`,
      house: `$${house.toFixed(2)}`,
    },
  };
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
