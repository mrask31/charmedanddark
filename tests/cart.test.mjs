import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBasket, validateMerchandise, readSavedCart, normalizeCart } from '../lib/shopify/cart-input.js';
import { reconcileCart } from '../lib/shopify/cart.js';
import { getAvailableInventory } from '../lib/inventory.js';

const id = n => `gid://shopify/ProductVariant/${n}`;
const item = (n, quantity = 1) => ({ shopifyVariantId: id(n), quantity, price: 0.01 });
const variant = (n, available = true) => ({ __typename: 'ProductVariant', id: id(n), availableForSale: available, quantityAvailable: 0, title: 'White / M', product: { title: 'Gothic Tee', handle: 'gothic-tee' } });
const money = amount => ({ amount: String(amount), currencyCode: 'USD' });
const rawCart = (quantities = [1], codes = [], allocations = []) => ({
  id: 'gid://shopify/Cart/test?key=secret', buyerIdentity: { countryCode: 'US' }, checkoutUrl: 'https://example.myshopify.com/checkouts/test',
  discountCodes: codes, discountAllocations: allocations,
  cost: { subtotalAmount: money(24.99), totalAmount: money(22.49), totalAmountEstimated: true },
  lines: { pageInfo: { hasNextPage: false }, nodes: quantities.map((quantity, index) => ({ id: `line-${index + 1}`, quantity, merchandise: variant(index + 1), discountAllocations: [], cost: { amountPerQuantity: money(24.99), compareAtAmountPerQuantity: money(29.99), totalAmount: money(24.99 * quantity) } })) },
});

test('rejects entire basket containing decimals, unresolved IDs, malformed IDs or quantities', () => {
  for (const invalid of [{ shopifyVariantId: id(2), quantity: 1.5 }, { slug: 'old-tee', quantity: 1 }, { shopifyVariantId: '2', quantity: 1 }, item(2, 0), item(2, '2'), item(2, 101), null]) {
    assert.throws(() => parseBasket([item(1), invalid]), error => error.status === 409 && error.issues.length > 0);
  }
  assert.throws(() => parseBasket([], { allowEmpty: false }));
});

test('coalesces exact IDs and discards supplied prices and metadata', () => {
  assert.deepEqual(parseBasket([item(1, 2), item(1, 3)]), [{ merchandiseId: id(1), quantity: 5 }]);
  assert.throws(() => parseBasket([item(1, 60), item(1, 60)]));
});

test('sellable untracked zero inventory is allowed; unavailable or removed variant blocks whole basket', () => {
  assert.doesNotThrow(() => validateMerchandise(parseBasket([item(1)]), [variant(1)]));
  assert.throws(() => validateMerchandise(parseBasket([item(1), item(2)]), [variant(1), variant(2, false)]), /Availability has changed/);
  assert.throws(() => validateMerchandise(parseBasket([item(1)]), [null]));
  assert.equal(getAvailableInventory({ availableForSale: true, variantQuantityAvailable: 0 }), null);
  assert.equal(getAvailableInventory({ availableForSale: false, variantQuantityAvailable: 9999 }), 0);
  assert.equal(getAvailableInventory({ availableForSale: true, inventoryTracked: true, inventoryPolicy: 'DENY', variantQuantityAvailable: 9999 }), 9999);
});

test('legacy cart migration retains ambiguous options for review instead of guessing a variant', () => {
  const saved = readSavedCart(JSON.stringify([{ slug: 'tee', selectedSize: 'L', quantity: 1 }, item(1)]));
  assert.equal(saved.version, 2);
  assert.equal(saved.cartId, null);
  assert.equal(saved.items.length, 2);
  assert.equal(saved.items[0].needsSelection, true);
  assert.equal(saved.items[1].needsSelection, false);
  assert.equal(saved.items[0].shopifyVariantId, undefined);
});

test('Shopify cost and variant label are preserved; member claims require an actual allocation', () => {
  const cart = rawCart([2], [{ code: 'HOUSE10', applicable: true }]);
  assert.equal(normalizeCart(cart).memberDiscountApplied, false);
  cart.discountAllocations = [{ code: 'HOUSE10', discountedAmount: money(2.50) }];
  const normalized = normalizeCart(cart);
  assert.equal(normalized.memberDiscountApplied, true);
  assert.equal(normalized.total, 22.49);
  assert.equal(normalized.items[0].price, 24.99);
  assert.equal(normalized.items[0].variant, 'White / M');
  assert.equal(normalized.items[0].quantity, 2);
});

test('invalid or unavailable basket makes no cart mutation', async () => {
  const calls = [];
  const fetcher = async (query, variables) => { calls.push({ query, variables }); return { nodes: [variant(1, false)] }; };
  await assert.rejects(reconcileCart({ items: [item(1), { slug: 'missing', quantity: 1 }] }, fetcher));
  assert.equal(calls.length, 0);
  await assert.rejects(reconcileCart({ items: [item(1)] }, fetcher));
  assert.equal(calls.length, 1);
  assert.ok(calls[0].query.includes('CommerceCartVariants'));
});

test('creates exact basket using server member decision without client prices', async () => {
  const calls = [];
  const fetcher = async (query, variables) => {
    calls.push({ query, variables });
    if (query.includes('query CommerceCartVariants')) return { nodes: [variant(1)] };
    return { cartCreate: { cart: rawCart(), userErrors: [], warnings: [] } };
  };
  const result = await reconcileCart({ items: [item(1)], isMember: false }, fetcher);
  assert.deepEqual(calls[1].variables.input.lines, [{ merchandiseId: id(1), quantity: 1 }]);
  assert.deepEqual(calls[1].variables.input.discountCodes, []);
  assert.deepEqual(calls[0].variables.country, 'US');
  assert.ok(calls[0].query.includes('@inContext(country: $country)'));
  assert.deepEqual(calls[1].variables.input.buyerIdentity, { countryCode: 'US' });
  assert.equal(result.cart.items[0].price, 24.99);
  assert.equal(result.needsReview, false);
});

test('expired Shopify cart is recreated with exact saved IDs and current prices', async () => {
  const fetcher = async query => {
    if (query.includes('query CommerceCartVariants')) return { nodes: [variant(1)] };
    if (query.includes('query CommerceCartGet')) return { cart: null };
    return { cartCreate: { cart: rawCart(), userErrors: [], warnings: [] } };
  };
  const result = await reconcileCart({ cartId: rawCart().id, items: [item(1)] }, fetcher);
  assert.equal(result.cart.items[0].shopifyVariantId, id(1));
  assert.equal(result.needsReview, false);
});

test('Shopify quantity adjustment forces review before checkout', async () => {
  const fetcher = async query => query.includes('query CommerceCartVariants') ? { nodes: [variant(1)] } : { cartCreate: { cart: rawCart([1]), userErrors: [], warnings: [{ code: 'MERCHANDISE_NOT_ENOUGH_STOCK', message: 'Only one is available.' }] } };
  const result = await reconcileCart({ items: [item(1, 3)], checkout: true }, fetcher);
  assert.equal(result.needsReview, true);
  assert.equal(result.cart.items[0].quantity, 1);
  assert.ok(result.messages.some(message => message.includes('review')));
  assert.equal(result.issues[0].acceptedQuantity, 1);
  assert.ok(result.issues[0].message.includes('Change the quantity to 1'));
});

test('existing cart is reused and HOUSE10 removed for unverified guest', async () => {
  const calls = [];
  const existing = rawCart([1], [{ code: 'HOUSE10', applicable: true }, { code: 'OTHER', applicable: true }]);
  const fetcher = async (query, variables) => {
    calls.push({ query, variables });
    if (query.includes('query CommerceCartVariants')) return { nodes: [variant(1)] };
    if (query.includes('query CommerceCartGet')) return { cart: existing };
    return { cartDiscountCodesUpdate: { cart: rawCart([1], [{ code: 'OTHER', applicable: true }]), userErrors: [] } };
  };
  const result = await reconcileCart({ cartId: existing.id, items: [item(1)], isMember: false }, fetcher);
  assert.equal(result.cart.id, existing.id);
  assert.deepEqual(calls[2].variables.discountCodes, ['OTHER']);
  assert.ok(!calls.some(call => call.query.includes('mutation CommerceCartCreate')));
});

test('mutation error surfaces current basket for review instead of continuing to checkout', async () => {
  const existing = rawCart();
  const fetcher = async query => {
    if (query.includes('query CommerceCartVariants')) return { nodes: [variant(1)] };
    if (query.includes('query CommerceCartGet')) return { cart: existing };
    return { cartLinesUpdate: { cart: existing, userErrors: [{ message: 'Quantity is unavailable.' }] } };
  };
  await assert.rejects(reconcileCart({ cartId: existing.id, items: [item(1, 2)], checkout: true }, fetcher), error => error.status === 409 && error.cart.items[0].quantity === 1);
});

test('legacy explicit size labels are not trusted merely because an old GID exists', () => {
  const saved = readSavedCart([{ ...item(1), size: 'L', variant: 'Size: L' }]);
  assert.equal(saved.items[0].needsSelection, true);
  assert.throws(() => parseBasket(saved.items), error => error.issues[0].message.includes('choose its options'));
  const roundtrip = readSavedCart(JSON.stringify({ version: 2, cartId: null, items: saved.items }));
  assert.equal(roundtrip.items[0].needsSelection, true);
});

test('availability changing between validation and mutation requires cart review', async () => {
  const unavailable = rawCart();
  unavailable.lines.nodes[0].merchandise.availableForSale = false;
  const fetcher = async query => query.includes('query CommerceCartVariants') ? { nodes: [variant(1)] } : { cartCreate: { cart: unavailable, userErrors: [], warnings: [] } };
  const result = await reconcileCart({ items: [item(1)], checkout: true }, fetcher);
  assert.equal(result.needsReview, true);
});

test('cross-tab refresh preserves new items and concurrent explicit additions combine', async () => {
  const { rebaseBasket } = await import('../lib/shopify/cart-input.js');
  const x = { ...item(1), cartKey: id(1) };
  const y = { ...item(2), cartKey: id(2) };
  assert.deepEqual(rebaseBasket([x], [x], [x, y]), [x, y]);
  assert.deepEqual(rebaseBasket([x], [x, y], [x, y]), [x, { ...y, quantity: 2 }]);
  assert.deepEqual(rebaseBasket([x], [], [x, y]), [y]);
});


test('existing cart country is aligned without sending null or replacement contact fields', async () => {
  const existing = rawCart();
  existing.buyerIdentity = { countryCode: 'CA', email: 'buyer@example.com', phone: '+15555550100' };
  const calls = [];
  const fetcher = async (query, variables) => {
    calls.push({ query, variables });
    if (query.includes('query CommerceCartVariants')) return { nodes: [variant(1)] };
    if (query.includes('query CommerceCartGet')) return { cart: existing };
    return { cartBuyerIdentityUpdate: { cart: rawCart(), userErrors: [], warnings: [] } };
  };
  await reconcileCart({ cartId: existing.id, items: [item(1)] }, fetcher);
  assert.deepEqual(calls[2].variables, { cartId: existing.id, buyerIdentity: { countryCode: 'US' } });
  assert.ok(calls[2].query.includes('cartBuyerIdentityUpdate'));
});
