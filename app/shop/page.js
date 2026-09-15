import { getProducts, isShopifyCatalogEnabled } from "@/lib/products";
import legacyMemberships from "@/data/commerce-collection-migration.json";
import ShopPageClient from "./page-new";

// Always fetch fresh data — no caching
export const revalidate = 0;

export const metadata = {
  title: "Shop Gothic Clothing, Bags & Home Décor",
  alternates: { canonical: "https://www.charmedanddark.com/shop" },
  description: "Explore gothic clothing, kisslock bags, book totes, candles, drinkware, and home décor. Shop Smutty Good Girl and everyday favorites from Charmed & Dark.",
};

export default async function ShopPage({ searchParams }) {
  const [catalogProducts, query] = await Promise.all([getProducts(), searchParams]);

  const products = isShopifyCatalogEnabled() ? catalogProducts : catalogProducts.map((product) => ({
    ...product,
    collections: Object.entries(legacyMemberships).filter(([, handles]) => handles.includes(product.slug || product.handle)).map(([handle]) => ({ handle })),
  }));
  return <ShopPageClient products={products} initialFilter={query?.category} initialQuery={query?.q} initialCollection={query?.collection} />;
}
