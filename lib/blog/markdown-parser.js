/**
 * Parses markdown content and replaces product references with links.
 * Converts [product:slug] syntax to markdown links pointing to /shop/[slug].
 * 
 * @param {string} markdown - The markdown content to parse
 * @param {string[]} validProductSlugs - Array of valid product slugs from the database
 * @returns {string} Processed markdown with product references converted to links
 * 
 * @example
 * parseProductReferences(
 *   "Check out our [product:gothic-ring] for a dark aesthetic.",
 *   ["gothic-ring"]
 * )
 * // Returns: "Check out our [gothic-ring](/shop/gothic-ring) for a dark aesthetic."
 * 
 * @example
 * parseProductReferences(
 *   "This [product:invalid-slug] doesn't exist.",
 *   ["gothic-ring"]
 * )
 * // Returns: "This invalid-slug doesn't exist."
 */
export function parseProductReferences(markdown, validProductSlugs = [], productLinks = {}) {
  if (!markdown) return '';
  
  return markdown.replace(
    /\[product:([^\]]+)\]/g,
    (match, slug) => {
      const canonical = Object.hasOwn(productLinks, slug)
        ? productLinks[slug]
        : validProductSlugs.includes(slug) ? slug : null;
      if (typeof canonical === 'string' && canonical) {
        const label = slug.replace(/[\\[\]]/g, '\\$&');
        return `[${label}](/shop/${encodeURIComponent(canonical)})`;
      }
      // Otherwise, just return the slug as plain text (no link)
      return slug;
    }
  );
}
