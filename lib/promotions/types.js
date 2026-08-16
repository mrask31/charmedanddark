/**
 * Promotion Engine — Domain Types (JSDoc)
 *
 * These types define the shape of promotion data as it flows through the system.
 * Using JSDoc for type safety without requiring TypeScript compilation.
 */

/**
 * @typedef {'draft' | 'scheduled' | 'active' | 'expired' | 'archived'} PromotionStatus
 */

/**
 * @typedef {'percentage' | 'fixed_amount'} PromotionType
 */

/**
 * @typedef {'all' | 'specific' | 'collection' | 'tag'} AppliesTo
 */

/**
 * @typedef {Object} Promotion
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {PromotionStatus} status
 * @property {boolean} enabled
 * @property {string} startDate - ISO timestamp
 * @property {string} endDate - ISO timestamp
 * @property {PromotionType} promotionType
 * @property {number|null} percentage
 * @property {number|null} fixedAmount
 * @property {AppliesTo} appliesTo
 * @property {boolean} excludeSanctuary
 * @property {string|null} heroTitle
 * @property {string|null} heroSubtitle
 * @property {string} heroCtaText
 * @property {string} heroCtaUrl
 * @property {string} accentColor
 * @property {string|null} badgeText
 * @property {boolean} countdownEnabled
 * @property {boolean} homepageEnabled
 * @property {boolean} landingPageEnabled
 * @property {boolean} navEnabled
 * @property {string|null} seoTitle
 * @property {string|null} seoDescription
 * @property {string|null} ogImageUrl
 * @property {string|null} shopifyDiscountId
 * @property {string[]} [productIds] - Targeted product IDs (loaded from junction)
 * @property {string[]} [excludedProductIds] - Excluded product IDs
 * @property {string[]} [collections] - Targeted collections/categories
 * @property {string[]} [tags] - Targeted tags
 * @property {Object.<string, {percentage?: number, fixedAmount?: number}>} [productOverrides] - Per-product overrides keyed by product ID
 */

/**
 * @typedef {Object} PromotionPricing
 * @property {number} basePrice - Original price before discount
 * @property {number} displayPrice - Price after promotion discount
 * @property {number} savings - Dollar amount saved
 * @property {number} percentage - Percentage discount applied
 * @property {string|null} badgeText - Badge text for product cards
 * @property {string} promotionName - Human-readable promotion name
 * @property {string} promotionSlug - URL slug for the promotion
 * @property {string} endsAt - ISO timestamp when promotion expires
 * @property {boolean} countdownEnabled - Whether to show countdown
 */

export {};
