# Product Images - Flat Structure

This folder contains all product images in a single flat structure for easy upload to Supabase Storage.

## File Naming Convention

```
[product-handle].jpg
```

Example:
```
set-of-3-starry-night-celestial-taper-candles.jpg
antique-mirror.jpg
skull-book-ends-gothic-lifesize-human.jpg
```

## Upload to Supabase Storage

1. Go to Supabase Dashboard → Storage
2. Create bucket named `products` (if not exists)
3. Upload all images from this folder
4. Copy public URLs
5. Paste URLs into Google Sheets Column K (`image_url`)
6. Run sync

## Public URL Format

```
https://ewsztwchfbjclbjsqhnd.supabase.co/storage/v1/object/public/products/[filename].jpg
```

Example:
```
https://ewsztwchfbjclbjsqhnd.supabase.co/storage/v1/object/public/products/antique-mirror.jpg
```

## Current Status

- **29 images** ready for upload
- All images are hero/primary product images
- File names match exact product handles from database
