import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProductReferences } from '../lib/blog/markdown-parser.js';
import { getInlineProductReferences, productMatchesReference, buildProductLinks } from '../lib/blog/product-references.js';

const product = {
  id: 'gid://shopify/Product/123', handle: 'current-bag',
  legacyIds: ['legacy-one', 'legacy-two'], aliases: ['original-bag', 'current-bag'],
};

test('Journal keeps multiple historical UUID references linked to the same live product', () => {
  assert.equal(productMatchesReference(product, 'legacy-one'), true);
  assert.equal(productMatchesReference(product, 'legacy-two'), true);
  assert.equal(productMatchesReference(product, 'different-product'), false);
});

test('old inline handles resolve to canonical URLs and unknown references stay plain text', () => {
  const content = 'See [product:original-bag] and [product:retired-bag].';
  assert.deepEqual(getInlineProductReferences(content), ['original-bag', 'retired-bag']);
  assert.equal(parseProductReferences(content, [], buildProductLinks([product])),
    'See [original-bag](/shop/current-bag) and retired-bag.');
  assert.equal(parseProductReferences(content, [], {}), 'See original-bag and retired-bag.');
  assert.equal(parseProductReferences('[product:toString]', [], {}), 'toString');
});


test('current Journal product URLs win over historical aliases and ambiguous aliases are not linked', () => {
  const links = buildProductLinks([
    { id: 'a', handle: 'first', aliases: ['second', 'shared'] },
    { id: 'b', handle: 'second', aliases: ['shared'] },
  ]);
  assert.equal(links.second, 'second');
  assert.equal(Object.hasOwn(links, 'shared'), false);
});
