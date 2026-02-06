/**
 * Inventory Ingestion Script
 * 
 * Reads data/canonical_products_pass1.csv and data/product_variants_pass1.csv
 * Generates complete TypeScript data modules for lib/products.ts and lib/apparel.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface CanonicalProduct {
  canon_sku: string;
  base_sku: string;
  name_raw: string;
  slug_suggestion: string;
  categories_raw: string;
  description_raw: string;
  price_usd: number;
  sale_price_usd?: number;
  currency: string;
  track_inventory: boolean;
  qty_base: number;
  backorder: boolean;
  realm: 'house' | 'uniform';
  variant_model: 'none' | 'one_dim' | 'two_dim';
  sku_count: number;
  image_url_base: string;
}

interface ProductVariantRow {
  canon_sku: string;
  variant_sku: string;
  option1: string;
  option2?: string;
  price_usd: number;
  sale_price_usd?: number;
  qty: number;
  image_url?: string;
  name_raw: string;
}

interface ProductVariant {
  id: string;
  label: string;
  pricePublic: number;
  priceSanctuary: number;
  inStock: boolean;
  isDefault?: boolean;
  image?: string;
}

interface ProductDescription {
  ritualIntro: string;
  objectDetails: string[];
  whoFor: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  realm: 'house' | 'uniform';
  category: string;
  status: string;
  pricePublic: number;
  priceSanctuary: number;
  shortDescription: string;
  description: ProductDescription;
  images: string[];
  inStock: boolean;
  mirrorEligible?: boolean;
  mirrorRole?: string;
  variants?: ProductVariant[];
}

// ============================================
// CSV PARSING
// ============================================

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parseProductsCSV(filePath: string): CanonicalProduct[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  
  const products: CanonicalProduct[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const product: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      const key = header.toLowerCase().replace(/ /g, '_');
      
      if (key === 'price_usd' || key === 'sale_price_usd' || key === 'qty_base') {
        product[key] = value ? parseFloat(value) : undefined;
      } else if (key === 'track_inventory' || key === 'backorder') {
        product[key] = value.toLowerCase() === 'true';
      } else if (key === 'sku_count') {
        product[key] = parseInt(value) || 0;
      } else {
        product[key] = value;
      }
    });
    
    products.push(product as CanonicalProduct);
  }
  
  return products;
}

function parseVariantsCSV(filePath: string): ProductVariantRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  
  const variants: ProductVariantRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const variant: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      
      if (header === 'price_usd' || header === 'sale_price_usd') {
        variant[header] = value ? parseFloat(value) : undefined;
      } else if (header === 'qty') {
        variant[header] = parseInt(value) || 0;
      } else {
        variant[header] = value;
      }
    });
    
    variants.push(variant as ProductVariantRow);
  }
  
  return variants;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateSanctuaryPrice(publicPrice: number): number {
  return Math.round(publicPrice * 0.9 * 100) / 100;
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripEmojis(text: string): string {
  // Remove emojis and other unicode symbols
  return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
}

function mapCategory(categoriesRaw: string, nameRaw: string): string {
  const name = nameRaw.toLowerCase();
  
  // Direct category mapping
  if (categoriesRaw) {
    const cat = categoriesRaw.toLowerCase();
    if (cat.includes('candle') || cat.includes('scent')) return 'Candles & Scent';
    if (cat.includes('drink') || cat.includes('mug') || cat.includes('cup')) return 'Ritual Drinkware';
    if (cat.includes('wall')) return 'Wall Objects';
    if (cat.includes('decor')) return 'Decor Objects';
    if (cat.includes('table') || cat.includes('display')) return 'Table & Display';
    if (cat.includes('use')) return 'Objects of Use';
  }
  
  // Infer from name
  if (name.includes('candle') || name.includes('incense')) return 'Candles & Scent';
  if (name.includes('mug') || name.includes('cup') || name.includes('glass') || name.includes('teacup') || name.includes('tumbler')) return 'Ritual Drinkware';
  if (name.includes('wall') || name.includes('art') || name.includes('shelf') || name.includes('decor')) return 'Wall Objects';
  if (name.includes('vase') || name.includes('frame') || name.includes('bowl') || name.includes('bookends') || name.includes('ornament')) return 'Decor Objects';
  if (name.includes('board') || name.includes('tray') || name.includes('dish') || name.includes('coaster')) return 'Table & Display';
  if (name.includes('journal') || name.includes('matches') || name.includes('sage') || name.includes('knives')) return 'Objects of Use';
  
  // Default
  console.log(`⚠️  Category inferred for "${nameRaw}" → "Decor Objects" (default)`);
  return 'Decor Objects';
}

// ============================================
// LOAD EXISTING PRODUCTS
// ============================================

function loadExistingProducts(): Map<string, any> {
  const existingMap = new Map();
  
  try {
    const productsPath = path.join(process.cwd(), 'lib', 'products.ts');
    const content = fs.readFileSync(productsPath, 'utf-8');
    
    // Extract product objects using regex
    const productMatches = content.matchAll(/{\s*id:\s*["']([^"']+)["']/g);
    
    for (const match of productMatches) {
      const id = match[1];
      // Extract mirror properties
      const idIndex = content.indexOf(`id: "${id}"`);
      const nextProductIndex = content.indexOf('{\n    id:', idIndex + 1);
      const productBlock = content.substring(idIndex, nextProductIndex > 0 ? nextProductIndex : content.length);
      
      const mirrorEligible = productBlock.includes('mirrorEligible: true');
      const mirrorRoleMatch = productBlock.match(/mirrorRole:\s*['"]([^'"]+)['"]/);
      const mirrorRole = mirrorRoleMatch ? mirrorRoleMatch[1] : undefined;
      
      existingMap.set(id, { mirrorEligible, mirrorRole });
    }
  } catch (error) {
    console.log('No existing products.ts found or error reading it');
  }
  
  return existingMap;
}

// ============================================
// BUILD PRODUCTS
// ============================================

function buildVariants(
  variantRows: ProductVariantRow[],
  canonicalProduct: CanonicalProduct
): ProductVariant[] {
  if (!variantRows || variantRows.length === 0) {
    return [];
  }
  
  const variants: ProductVariant[] = variantRows.map(row => {
    const pricePublic = row.sale_price_usd || row.price_usd;
    const priceSanctuary = calculateSanctuaryPrice(pricePublic);
    
    // Generate label
    let label = row.option1;
    if (row.option2) {
      label = `${row.option1} / ${row.option2}`;
    }
    
    // Generate stable ID
    const idParts = [canonicalProduct.canon_sku, row.option1, row.option2].filter(Boolean);
    const id = normalizeId(idParts.join('-'));
    
    return {
      id,
      label,
      pricePublic,
      priceSanctuary,
      inStock: row.qty > 0,
      image: row.image_url || undefined
    };
  });
  
  // Select default variant: highest qty, then lowest price, then first
  let defaultVariant = variants[0];
  let maxQty = variantRows[0].qty;
  
  for (let i = 1; i < variants.length; i++) {
    const currentQty = variantRows[i].qty;
    if (currentQty > maxQty) {
      defaultVariant = variants[i];
      maxQty = currentQty;
    } else if (currentQty === maxQty && variants[i].pricePublic < defaultVariant.pricePublic) {
      defaultVariant = variants[i];
    }
  }
  
  defaultVariant.isDefault = true;
  
  return variants;
}

function buildProduct(
  canonical: CanonicalProduct,
  variantRows: ProductVariantRow[],
  existingProduct?: any
): Product {
  const variants = buildVariants(variantRows, canonical);
  
  // Determine pricing
  let pricePublic: number;
  let priceSanctuary: number;
  
  if (variants.length > 0) {
    const defaultVariant = variants.find(v => v.isDefault) || variants[0];
    pricePublic = defaultVariant.pricePublic;
    priceSanctuary = defaultVariant.priceSanctuary;
  } else {
    pricePublic = canonical.sale_price_usd || canonical.price_usd;
    priceSanctuary = calculateSanctuaryPrice(pricePublic);
  }
  
  // Parse images
  const images = canonical.image_url_base
    ? canonical.image_url_base.split(';').map(url => url.trim()).filter(Boolean)
    : [];
  
  // Clean name (remove size/color info)
  const name = canonical.name_raw
    .replace(/\s*–\s*.*$/, '') // Remove everything after em dash
    .replace(/\s*\|\s*.*$/, '') // Remove everything after pipe
    .trim();
  
  // Generate slug
  const slug = canonical.slug_suggestion || createSlug(name);
  
  // Generate ID
  const id = normalizeId(slug);
  
  // Map category
  const category = mapCategory(canonical.categories_raw, canonical.name_raw);
  
  // Create description (store as-is for now, will need manual curation)
  const cleanDescription = stripEmojis(canonical.description_raw);
  const description: ProductDescription = {
    ritualIntro: stripEmojis(cleanDescription.substring(0, 200) + '...'),
    objectDetails: ['Details from CSV'],
    whoFor: 'For those who seek the extraordinary.'
  };
  
  // Preserve mirror discipline
  let mirrorEligible = false;
  let mirrorRole: string | undefined = undefined;
  
  if (existingProduct) {
    mirrorEligible = existingProduct.mirrorEligible || false;
    mirrorRole = existingProduct.mirrorRole;
  }
  
  // Force apparel to never be mirror-eligible
  if (canonical.realm === 'uniform') {
    mirrorEligible = false;
    mirrorRole = undefined;
  }
  
  const product: Product = {
    id,
    slug,
    name,
    realm: canonical.realm,
    category,
    status: 'core',
    pricePublic,
    priceSanctuary,
    shortDescription: stripEmojis(canonical.description_raw.substring(0, 150) + '...'),
    description,
    images,
    inStock: canonical.qty_base > 0,
    mirrorEligible: mirrorEligible || undefined,
    mirrorRole,
    variants: variants.length > 0 ? variants : undefined
  };
  
  return product;
}

// ============================================
// MODULE GENERATION
// ============================================

function formatProductForTS(product: Product, indent: string = '  '): string {
  const lines: string[] = [];
  
  lines.push(`${indent}{`);
  lines.push(`${indent}  id: "${product.id}",`);
  lines.push(`${indent}  slug: "${product.slug}",`);
  lines.push(`${indent}  name: "${product.name}",`);
  lines.push(`${indent}  realm: "${product.realm}",`);
  lines.push(`${indent}  category: "${product.category}",`);
  lines.push(`${indent}  status: "${product.status}",`);
  lines.push(`${indent}  pricePublic: ${product.pricePublic.toFixed(2)},`);
  lines.push(`${indent}  priceSanctuary: calculateSanctuaryPrice(${product.pricePublic.toFixed(2)}),`);
  lines.push(`${indent}  shortDescription: "${product.shortDescription.replace(/"/g, '\\"')}",`);
  lines.push(`${indent}  description: {`);
  lines.push(`${indent}    ritualIntro: "${product.description.ritualIntro.replace(/"/g, '\\"')}",`);
  lines.push(`${indent}    objectDetails: ${JSON.stringify(product.description.objectDetails)},`);
  lines.push(`${indent}    whoFor: "${product.description.whoFor.replace(/"/g, '\\"')}"`);
  lines.push(`${indent}  },`);
  lines.push(`${indent}  images: ${JSON.stringify(product.images)},`);
  lines.push(`${indent}  inStock: ${product.inStock},`);
  
  if (product.mirrorEligible) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, ',');
    lines.push(`${indent}  mirrorEligible: true,`);
    if (product.mirrorRole) {
      lines.push(`${indent}  mirrorRole: '${product.mirrorRole}',`);
    }
  }
  
  if (product.variants && product.variants.length > 0) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, ',');
    lines.push(`${indent}  variants: [`);
    product.variants.forEach((variant, idx) => {
      lines.push(`${indent}    {`);
      lines.push(`${indent}      id: "${variant.id}",`);
      lines.push(`${indent}      label: "${variant.label}",`);
      lines.push(`${indent}      pricePublic: ${variant.pricePublic.toFixed(2)},`);
      lines.push(`${indent}      priceSanctuary: calculateSanctuaryPrice(${variant.pricePublic.toFixed(2)}),`);
      lines.push(`${indent}      inStock: ${variant.inStock}${variant.isDefault || variant.image ? ',' : ''}`);
      if (variant.isDefault) {
        lines.push(`${indent}      isDefault: true${variant.image ? ',' : ''}`);
      }
      if (variant.image) {
        lines.push(`${indent}      image: "${variant.image}"`);
      }
      lines.push(`${indent}    }${idx < product.variants!.length - 1 ? ',' : ''}`);
    });
    lines.push(`${indent}  ]`);
  } else {
    // Remove trailing comma from last property
    lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
  }
  
  lines.push(`${indent}}`);
  
  return lines.join('\n');
}

function generateProductsModule(products: Product[]): string {
  const header = `/**
 * Product Data Foundation for Charmed & Dark
 * 
 * This module serves as the single source of truth for product data
 * until Shopify integration is implemented.
 * 
 * AUTO-GENERATED from canonical_products_pass1.csv and product_variants_pass1.csv
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ProductStatus = "core" | "drop_candidate" | "hold" | "archive";

export type ProductRealm = "house" | "uniform";

export type ProductCategory =
  | "Candles & Scent"
  | "Ritual Drinkware"
  | "Wall Objects"
  | "Decor Objects"
  | "Table & Display"
  | "Objects of Use";

export type MirrorRole =
  | 'containment'
  | 'warmth'
  | 'witness'
  | 'boundary'
  | 'grounding'
  | 'return'
  | 'amplification'
  | 'orientation';

export interface ProductVariant {
  id: string;
  label: string;
  pricePublic: number;
  priceSanctuary: number;
  inStock: boolean;
  isDefault?: boolean;
  image?: string;
}

export interface ProductDescription {
  ritualIntro: string;
  objectDetails: string[];
  whoFor: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  realm: ProductRealm;
  category: ProductCategory;
  status: ProductStatus;
  pricePublic: number;
  priceSanctuary: number;
  shortDescription: string;
  description: ProductDescription;
  images: string[];
  inStock: boolean;
  mirrorEligible?: boolean;
  mirrorRole?: MirrorRole;
  variants?: ProductVariant[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function calculateSanctuaryPrice(publicPrice: number): number {
  return Math.round(publicPrice * 0.9 * 100) / 100;
}

// ============================================
// PRODUCT DATA
// ============================================

export const products: Product[] = [
`;

  const productStrings = products.map(p => formatProductForTS(p));
  const body = productStrings.join(',\n');
  
  const footer = `
];

// ============================================
// QUERY FUNCTIONS
// ============================================

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(product => product.slug === slug);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter(product => product.category === category);
}

export function getHouseProducts(): Product[] {
  return products.filter(product => 
    product.realm === 'house' && product.status !== 'archive'
  );
}

export function getCoreProducts(): Product[] {
  return products.filter(product => product.status === "core");
}

export function getInStockProducts(): Product[] {
  return products.filter(product => product.inStock);
}

export function getCategoriesWithCounts(): Array<{ category: ProductCategory; count: number }> {
  const categoryCounts = new Map<ProductCategory, number>();
  
  products.forEach(product => {
    const current = categoryCounts.get(product.category) || 0;
    categoryCounts.set(product.category, current + 1);
  });
  
  return Array.from(categoryCounts.entries()).map(([category, count]) => ({
    category,
    count
  }));
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.shortDescription.toLowerCase().includes(lowerQuery) ||
    product.description.ritualIntro.toLowerCase().includes(lowerQuery) ||
    product.description.whoFor.toLowerCase().includes(lowerQuery)
  );
}
`;

  return header + body + footer;
}

// ============================================
// MAIN EXECUTION
// ============================================

function main() {
  const isDryRun = process.argv.includes('--dry-run');
  
  console.log('🔮 Starting Inventory Ingestion...\n');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be written\n');
  }
  
  // Parse CSVs
  console.log('📖 Reading CSV files...');
  const canonicalProducts = parseProductsCSV('data/canonical_products_pass1.csv');
  const variantRows = parseVariantsCSV('data/product_variants_pass1.csv');
  
  console.log(`✅ Parsed ${canonicalProducts.length} canonical products`);
  console.log(`✅ Parsed ${variantRows.length} variant SKUs\n`);
  
  // Group variants by canon_sku
  const variantsByProduct = new Map<string, ProductVariantRow[]>();
  variantRows.forEach(variant => {
    const existing = variantsByProduct.get(variant.canon_sku) || [];
    existing.push(variant);
    variantsByProduct.set(variant.canon_sku, existing);
  });
  
  // Load existing products for mirror preservation
  console.log('🔍 Loading existing products for Mirror discipline preservation...');
  const existingProducts = loadExistingProducts();
  console.log(`✅ Loaded ${existingProducts.size} existing products\n`);
  
  // Build all products
  console.log('🏗️  Building product objects...');
  const allProducts: Product[] = [];
  
  for (const canonical of canonicalProducts) {
    const variants = variantsByProduct.get(canonical.canon_sku) || [];
    const existing = existingProducts.get(normalizeId(canonical.slug_suggestion || canonical.name_raw));
    const product = buildProduct(canonical, variants, existing);
    allProducts.push(product);
  }
  
  // Separate by realm
  const houseProducts = allProducts.filter(p => p.realm === 'house');
  const uniformProducts = allProducts.filter(p => p.realm === 'uniform');
  
  const productsWithVariants = allProducts.filter(p => p.variants && p.variants.length > 0);
  const totalVariants = productsWithVariants.reduce((sum, p) => sum + (p.variants?.length || 0), 0);
  
  console.log(`✅ Built ${allProducts.length} total products`);
  console.log(`   📦 House: ${houseProducts.length}`);
  console.log(`   👕 Uniform: ${uniformProducts.length}`);
  console.log(`   🔀 Products with variants: ${productsWithVariants.length}`);
  console.log(`   📊 Total variants: ${totalVariants}\n`);
  
  if (isDryRun) {
    console.log('🔍 DRY RUN COMPLETE - No files written');
    console.log('\nTo generate files, run without --dry-run flag:');
    console.log('  npx ts-node scripts/ingest-inventory.ts\n');
    return;
  }
  
  // Generate TypeScript modules
  console.log('📝 Generating TypeScript modules...');
  
  const productsModule = generateProductsModule(houseProducts);
  fs.writeFileSync(path.join(process.cwd(), 'lib', 'products.ts'), productsModule);
  console.log(`✅ Generated lib/products.ts with ${houseProducts.length} House products`);
  
  // For now, we'll keep apparel.ts as-is since we only have 2 uniform items
  // and they need proper apparel-specific structure
  console.log(`⚠️  Uniform products (${uniformProducts.length}) need manual curation for apparel.ts\n`);
  
  console.log('=== INVENTORY EXPANSION COMPLETE ===');
  console.log(`Total Canonical Products: ${canonicalProducts.length}`);
  console.log(`House Products: ${houseProducts.length}`);
  console.log(`Uniform Products: ${uniformProducts.length}`);
  console.log(`Products with Variants: ${productsWithVariants.length}`);
  console.log(`Total Variants: ${totalVariants}`);
}

main();
