// The merchant has retained this Summerween original as a year-round design.
export const SUMMERWEEN_SURVIVOR_HANDLE = 'bones-brews-summerween-skeleton-graphic-t-shirt';

export function isSummerweenSurvivor(product) {
  return (product.handle || product.slug) === SUMMERWEEN_SURVIVOR_HANDLE;
}
