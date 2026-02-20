# Product Images

This directory contains images for the 50 physical home objects stored in Supabase.

## Structure

Each product should have its own folder named after its `handle`:

```
products/
  gothic-candle-holder/
    hero.jpg      # Main product image (required)
    front.jpg     # Front view (optional)
    hover.jpg     # Hover state image (optional)
  velvet-throw-pillow/
    hero.jpg
    front.jpg
    hover.jpg
  ...
```

## Image Guidelines

- **Format**: JPG or PNG
- **Dimensions**: 
  - Hero: 800x1000px (4:5 aspect ratio)
  - Front: 800x1000px
  - Hover: 800x1000px
- **File Size**: Keep under 500KB per image
- **Naming**: Use lowercase, exact filenames: `hero.jpg`, `front.jpg`, `hover.jpg`

## Fallback Behavior

- If `hero.jpg` is missing, a placeholder will be shown
- If `front.jpg` or `hover.jpg` are missing, they simply won't display
- Hover state will use `hero.jpg` if `hover.jpg` is not available

## Shopify Products

Shopify apparel products use images from Shopify's CDN, not this directory.
