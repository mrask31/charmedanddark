/** Shared cart contracts. Browser prices are presentation snapshots, never checkout inputs. */
export const CART_STORAGE_VERSION = 2;
export const MAX_CART_LINES = 100;
export const MAX_LINE_QUANTITY = 100;
export const isVariantId = (id) => typeof id === 'string' && /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(id);

export class CartError extends Error {
  constructor(message, status = 400, issues = [], cart = null) {
    super(message);
    this.status = status;
    this.issues = issues;
    this.cart = cart;
  }
}

export function parseBasket(items, { allowEmpty = true } = {}) {
  if (!Array.isArray(items) || items.length > MAX_CART_LINES || (!allowEmpty && !items.length)) {
    throw new CartError('Please review your cart before continuing.');
  }
  const lines = new Map();
  const issues = [];
  items.forEach((item, index) => {
    if (item?.needsSelection || !isVariantId(item?.shopifyVariantId)) {
      issues.push({ index, cartKey: item?.cartKey, message: 'Please open this product and choose its options again.' });
      return;
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_LINE_QUANTITY) {
      issues.push({ index, cartKey: item?.cartKey, merchandiseId: item.shopifyVariantId, message: 'Choose a whole-number quantity from 1 to 100.' });
      return;
    }
    const quantity = (lines.get(item.shopifyVariantId)?.quantity || 0) + item.quantity;
    if (quantity > MAX_LINE_QUANTITY) {
      issues.push({ index, merchandiseId: item.shopifyVariantId, message: 'A maximum of 100 of one option can be added at a time.' });
    }
    lines.set(item.shopifyVariantId, { merchandiseId: item.shopifyVariantId, quantity });
  });
  if (issues.length) throw new CartError('Some items need your attention. Review the messages below.', 409, issues);
  return [...lines.values()];
}

export function validateMerchandise(lines, nodes) {
  const byId = new Map(nodes.filter(Boolean).map(node => [node.id, node]));
  const issues = lines.flatMap(line => {
    const variant = byId.get(line.merchandiseId);
    if (!variant || variant.__typename !== 'ProductVariant') {
      return [{ merchandiseId: line.merchandiseId, message: 'This option is no longer available. Choose another option or remove it.' }];
    }
    // A sellable variant may have zero inventory when tracking is disabled or backorders are permitted.
    if (!variant.availableForSale) {
      return [{ merchandiseId: line.merchandiseId, message: `${variant.product?.title || 'This option'} is sold out. Please remove it to continue.` }];
    }
    return [];
  });
  if (issues.length) throw new CartError('Availability has changed. Please review your selection.', 409, issues);
}

export function basketMatches(lines, cartItems) {
  const actual = new Map();
  for (const item of cartItems) actual.set(item.shopifyVariantId, (actual.get(item.shopifyVariantId) || 0) + item.quantity);
  return lines.length === actual.size && lines.every(line => actual.get(line.merchandiseId) === line.quantity);
}

export function readSavedCart(value) {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  const sourceItems = Array.isArray(parsed) ? parsed : parsed?.version === CART_STORAGE_VERSION ? parsed.items : [];
  const items = Array.isArray(sourceItems) ? sourceItems.map((item, index) => ({
    ...item,
    cartKey: item.cartKey || item.shopifyVariantId || `saved-${index}`,
    needsSelection: Boolean(item.needsSelection || !isVariantId(item.shopifyVariantId) || (Array.isArray(parsed) && (item.size || item.variant))),
  })) : [];
  return { version: CART_STORAGE_VERSION, cartId: !Array.isArray(parsed) && parsed?.version === CART_STORAGE_VERSION && typeof parsed.cartId === 'string' ? parsed.cartId : null, items };
}

const amount = value => Number(value?.amount || 0);
const allocations = values => (values || []).map(value => ({
  title: value.title || value.code || 'Discount',
  amount: amount(value.discountedAmount),
  currency: value.discountedAmount?.currencyCode,
}));

export function normalizeCart(cart) {
  if (!cart) return null;
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    currency: cart.cost.totalAmount.currencyCode,
    subtotal: amount(cart.cost.subtotalAmount),
    total: amount(cart.cost.totalAmount),
    totalEstimated: cart.cost.totalAmountEstimated,
    discounts: allocations(cart.discountAllocations),
    discountCodes: cart.discountCodes || [],
    memberDiscountApplied: (cart.discountCodes || []).some(code => code.code.toUpperCase() === 'HOUSE10' && code.applicable)
      && [...(cart.discountAllocations || []), ...cart.lines.nodes.flatMap(line => line.discountAllocations || [])]
        .some(allocation => allocation.code?.toUpperCase() === 'HOUSE10' && amount(allocation.discountedAmount) > 0),
    items: cart.lines.nodes.map(line => {
      const variant = line.merchandise;
      return {
        cartKey: variant.id,
        lineId: line.id,
        shopifyVariantId: variant.id,
        slug: variant.product.handle,
        name: variant.product.title,
        variant: variant.title === 'Default Title' ? null : variant.title,
        imageUrl: variant.image?.url || variant.product.featuredImage?.url || null,
        quantity: line.quantity,
        price: amount(line.cost.amountPerQuantity),
        originalPrice: line.cost.compareAtAmountPerQuantity ? amount(line.cost.compareAtAmountPerQuantity) : null,
        lineTotal: amount(line.cost.totalAmount),
        currency: line.cost.totalAmount.currencyCode,
        available: variant.availableForSale,
        discounts: allocations(line.discountAllocations),
        needsSelection: false,
      };
    }),
  };
}

/** Rebase this tab's explicit edits onto the latest shared selection. */
export function rebaseBasket(base, desired, latest) {
  const key = item => item.cartKey || item.shopifyVariantId;
  const before = new Map(base.map(item => [key(item), item]));
  const after = new Map(desired.map(item => [key(item), item]));
  const current = new Map(latest.map(item => [key(item), item]));
  for (const [id] of before) if (!after.has(id)) current.delete(id);
  for (const [id, item] of after) {
    const previous = before.get(id);
    const delta = item.quantity - (previous?.quantity || 0);
    if (!previous || delta !== 0) {
      const quantity = (current.get(id)?.quantity || 0) + delta;
      if (quantity > 0) current.set(id, { ...item, quantity });
      else current.delete(id);
    }
  }
  return [...current.values()];
}


export function basketReviewIssues(lines, cartItems) {
  const actual = new Map(cartItems.map(item => [item.shopifyVariantId, item]));
  return lines.flatMap(line => {
    const item = actual.get(line.merchandiseId);
    if (!item || item.available === false) return [{ merchandiseId: line.merchandiseId, message: 'Shopify could not keep this option available. Choose another option or remove it.' }];
    if (item.quantity !== line.quantity) return [{
      merchandiseId: line.merchandiseId,
      acceptedQuantity: item.quantity,
      message: `Shopify currently has ${item.quantity} of your requested ${line.quantity} in this cart. Change the quantity to ${item.quantity} to continue, or choose another quantity.`,
    }];
    return [];
  });
}
