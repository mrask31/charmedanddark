/**
 * Generates a URL-safe slug from a title string.
 * Converts to lowercase, replaces spaces with hyphens, and removes special characters.
 * Only allows alphanumeric characters and hyphens.
 * 
 * @param {string} title - The title to convert to a slug
 * @returns {string} URL-safe slug
 * 
 * @example
 * generateSlug("Gothic Fashion Guide") // "gothic-fashion-guide"
 * generateSlug("The Raven's Call: A Dark Tale") // "the-ravens-call-a-dark-tale"
 * generateSlug("Product #1 (New!)") // "product-1-new"
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple consecutive hyphens with a single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}
