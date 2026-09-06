import { CartError, parseBasket, validateMerchandise, normalizeCart, basketMatches, basketReviewIssues } from './cart-input.js';

export const CART_FRAGMENT = `fragment CommerceCart on Cart {
  id checkoutUrl
  buyerIdentity { countryCode }
  discountCodes { code applicable }
  discountAllocations { discountedAmount { amount currencyCode } ... on CartAutomaticDiscountAllocation { title } ... on CartCodeDiscountAllocation { code } }
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } totalAmountEstimated }
  lines(first: 250) {
    pageInfo { hasNextPage }
    nodes {
      id quantity
      cost { amountPerQuantity { amount currencyCode } compareAtAmountPerQuantity { amount currencyCode } totalAmount { amount currencyCode } }
      discountAllocations { discountedAmount { amount currencyCode } ... on CartAutomaticDiscountAllocation { title } ... on CartCodeDiscountAllocation { code } }
      merchandise { ... on ProductVariant { id title availableForSale image { url } product { handle title featuredImage { url } } } }
    }
  }
}`;
export const CART_QUERY = `${CART_FRAGMENT} query CommerceCartGet($id: ID!) { cart(id: $id) { ...CommerceCart } }`;
export const VARIANTS_QUERY = `query CommerceCartVariants($ids: [ID!]!, $country: CountryCode!) @inContext(country: $country) { nodes(ids: $ids) { __typename ... on ProductVariant { id availableForSale quantityAvailable product { title } } } }`;
export const CART_MUTATIONS = {
  cartBuyerIdentityUpdate: `${CART_FRAGMENT} mutation CommerceCartBuyerCountry($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) { cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) { cart { ...CommerceCart } userErrors { field message } warnings { code message } } }`,
  cartCreate: `${CART_FRAGMENT} mutation CommerceCartCreate($input: CartInput!) { cartCreate(input: $input) { cart { ...CommerceCart } userErrors { field message } warnings { code message } } }`,
  cartLinesAdd: `${CART_FRAGMENT} mutation CommerceCartAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CommerceCart } userErrors { field message } warnings { code message } } }`,
  cartLinesUpdate: `${CART_FRAGMENT} mutation CommerceCartUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CommerceCart } userErrors { field message } warnings { code message } } }`,
  cartLinesRemove: `${CART_FRAGMENT} mutation CommerceCartRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CommerceCart } userErrors { field message } warnings { code message } } }`,
  cartDiscountCodesUpdate: `${CART_FRAGMENT} mutation CommerceCartDiscounts($cartId: ID!, $discountCodes: [String!]!) { cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) { cart { ...CommerceCart } userErrors { field message } } }`,
  cartAttributesUpdate: `${CART_FRAGMENT} mutation CommerceCartAttributes($cartId: ID!, $attributes: [AttributeInput!]!) { cartAttributesUpdate(cartId: $cartId, attributes: $attributes) { cart { ...CommerceCart } userErrors { field message } } }`,
};

const query = async (document, variables) => {
  const { shopifyFetch } = await import('./client.js');
  return shopifyFetch({ query: document, variables, cache: 'no-store' });
};

export async function reconcileCart({ cartId, items, isMember = false, attributes = [], checkout = false }, fetcher = query) {
  const lines = parseBasket(items, { allowEmpty: !checkout });
  const country = process.env.SHOPIFY_BUYER_COUNTRY || 'US';
  if (cartId != null && (typeof cartId !== 'string' || !cartId.startsWith('gid://shopify/Cart/') || cartId.length > 2048)) {
    throw new CartError('Your saved cart could not be read. Please refresh your selection.');
  }
  const merchandise = lines.length ? await fetcher(VARIANTS_QUERY, { ids: lines.map(line => line.merchandiseId), country }) : { nodes: [] };
  validateMerchandise(lines, merchandise.nodes || []);
  let cart = cartId ? (await fetcher(CART_QUERY, { id: cartId })).cart : null;
  const messages = [];
  if (cart?.lines.pageInfo.hasNextPage) throw new CartError('This cart needs to be reviewed in Shopify checkout. Please contact us for help.', 409);

  async function mutate(name, variables) {
    const result = (await fetcher(CART_MUTATIONS[name], variables))[name];
    if (!result) throw new Error('Shopify did not return a cart.');
    if (result.userErrors?.length) {
      const current = normalizeCart(result.cart || cart);
      throw new CartError(result.userErrors.map(error => error.message).join(' '), 409, current ? basketReviewIssues(lines, current.items) : [], current);
    }
    if (!result.cart) throw new Error('Shopify did not return a cart.');
    messages.push(...(result.warnings || []).map(warning => warning.message));
    cart = result.cart;
  }

  if (!cart && !lines.length) return { cart: null, messages: [], needsReview: false };
  if (!cart) {
    await mutate('cartCreate', { input: { lines, buyerIdentity: { countryCode: country }, discountCodes: isMember ? ['HOUSE10'] : [], attributes } });
  } else {
    if (cart.buyerIdentity?.countryCode !== country) {
      // Omit all other buyer fields: changing storefront market must not clear contact/customer details.
      await mutate('cartBuyerIdentityUpdate', { cartId: cart.id, buyerIdentity: { countryCode: country } });
    }
    const desiredIds = new Set(lines.map(line => line.merchandiseId));
    const existingLines = cart.lines.nodes;
    const retained = new Map();
    const remove = [];
    for (const line of existingLines) {
      const id = line.merchandise.id;
      if (!desiredIds.has(id) || retained.has(id)) remove.push(line.id);
      else retained.set(id, line);
    }
    if (remove.length) await mutate('cartLinesRemove', { cartId: cart.id, lineIds: remove });
    const updates = lines.filter(line => retained.has(line.merchandiseId) && retained.get(line.merchandiseId).quantity !== line.quantity).map(line => ({ id: retained.get(line.merchandiseId).id, quantity: line.quantity }));
    if (updates.length) await mutate('cartLinesUpdate', { cartId: cart.id, lines: updates });
    const additions = lines.filter(line => !retained.has(line.merchandiseId));
    if (additions.length) await mutate('cartLinesAdd', { cartId: cart.id, lines: additions });
    const codes = cart.discountCodes.map(code => code.code).filter(code => code.toUpperCase() !== 'HOUSE10');
    if (isMember) codes.push('HOUSE10');
    if (JSON.stringify(codes) !== JSON.stringify(cart.discountCodes.map(code => code.code))) {
      await mutate('cartDiscountCodesUpdate', { cartId: cart.id, discountCodes: codes });
    }
    if (attributes.length) await mutate('cartAttributesUpdate', { cartId: cart.id, attributes });
  }
  const normalized = normalizeCart(cart);
  const needsReview = !basketMatches(lines, normalized.items) || normalized.items.some(item => item.available === false);
  if (needsReview) messages.push('Shopify updated your quantities or availability. Please review your cart before checkout.');
  return { cart: normalized, messages: [...new Set(messages)], needsReview, issues: basketReviewIssues(lines, normalized.items) };
}
