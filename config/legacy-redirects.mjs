// Verified replacements for legacy store URLs found in Search Console on 2026-09-17.
// Keep explicit product mappings ahead of the generic /shop/ols/products rule.
// Do not add broad redirects for missing products or individual blog articles.
export const legacyProductHandles = {
  'xn-the-obsidian-twist-glossy-black-spiral-taper-candles-pair-cs61b': '2-pack-17-halloween-handmade-black-home-decor-taper-candles',
  'xn-the-blood-moon-spiral-solid-crimson-taper-set-4-pack-ps38a': 'christmas-red-handmade-spiral-taper-holiday-candles-set-4',
  'xn-the-midnight-coffin-vanity-tray-matte-black-trinket-dish-vz69a': 'black-gothic-coffin-shaped-gothic-trinket-tray',
  'xn-the-witching-hour-ritual-candle-white-sage-cleansing-blend-r690b': 'witching-hour-white-sage-gothic-candle',
  'xn-the-ravenwood-branch-candelabra-dark-metal-triple-taper-holder-with-birds-w580c': 'bird-branch-candle-holder',
  'lunar-arc-hammered-bracelet': 'hammered-moon-bracelet-delicate-modern-witchy-jewelry',
  'white-sage-smudge-sticks': 'white-sage-smudge-sticks-in-bulk',
  'white-sage-w-eucalyptus-smudge-sticks': 'white-sage-w-eucalyptus-smudge-sticks-in-bulk',
  'wicked-witch-crescent-moon-glass-ornament': 'wicked-witch-and-crescent-moon-glass-christmas-ornament',
  'brass-and-glass-soap-dish': 'brass-glass-soap-dish',
  'xn-the-midnight-bloom-tealight-holder-matte-black-resin-rose-wl30b': 'black-rose-resin-tealight-candle-holder',
  'xn-the-emerald-celestial-pillow-velvet-moon-star-embroidery-o690b': 'moon-and-stars-pillow',
  'heart-shaped-resin-flower-vase': 'heart-shaped-resin-flower-vases-stunning-decorative-6-5x4-5',
  'xn-the-serpents-coil-sculpted-3d-snake-taper-candles-pair-gl30b': '2pcs-halloween-3d-snake-shaped-smokeless-taper-candle-cm071',
  'luxury-satin-6-piece-sheet-set': 'luxury-satin-6-piece-sheet-set-black',
  'xn-the-shadow-spire-trio-matte-black-3-piece-candlestick-set-jl30b': 'taper-candle-holder-set',
  'xn-the-verdant-gradient-spiral-taper-candle-set-4-pack-q667a': 'green-gradient-set-4-handmade-spiral-taper-holiday-candles',
  'xn-the-ravens-watch-pillar-stand-gothic-candle-holder-5e75aqi': 'mystic-raven-gothic-pillar-candle-holder',
  'xn-the-gloomy-gingerbread-spooky-gothic-creepmas-ornament-qs38a': 'spooky-gingerbread-man-gothic-christmas-ornament',
  'halloween-skeleton-black-and-white-ornaments': 'halloween-skeleton-black-and-white-ornament-set',
  'white-sage-with-dried-lavender-smudge-sticks': 'white-sage-dried-lavender-smudge-sticks-bulk-handcrafted',
  'web-of-becoming-spider-lariat': 'gossamer-guardian-spider-lariat-halloween-jewelry',
  'eternal-rest-coffin-studs': 'coffin-studs-gold-and-silver-halloween-vampire-gothic',
  'mesa-18-piece-stoneware-dinnerware-set': 'joyjolt-mesa-18-piece-stoneware-dinnerware-set',
  'skull-book-ends-gothic-lifesize-human': 'skull-book-ends-gothic-lifesize-human-halloween-fall-decor',
  'creepy-nun-glass-ornament': 'spooky-decor-creepy-nun-themed-glass-ornament',
  'xn-the-twilight-blush-ritual-candle-black-rose-cork-8e75a': 'black-rose-twilight-blush-gothic-candle',
  'midnight-wing-dual-taper-candle-holder-matte-black': 'bat-candle-holder',
};

export const legacyRedirects = [
  ...Object.entries(legacyProductHandles).flatMap(([oldHandle, currentHandle]) =>
    ['/shop/ols/products/', '/shop/'].map((prefix) => ({
      source: `${prefix}${oldHandle}`,
      destination: `/shop/${currentHandle}`,
      permanent: true,
    })),
  ),
  { source: '/blog', destination: '/journal', permanent: true },
  { source: '/shop-apparel', destination: '/collections/gothic-clothing', permanent: true },
];
