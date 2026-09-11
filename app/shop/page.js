import ShopDestinations from "@/components/shop/ShopDestinations";
import { getProducts, isShopifyCatalogEnabled } from "@/lib/products";
import legacyMemberships from "@/data/commerce-collection-migration.json";
import ShopPageClient from "./page-new";

// Always fetch fresh data — no caching
export const revalidate = 0;

export const metadata = {
  title: "The Atelier",
  alternates: { canonical: "https://www.charmedanddark.com/shop" },
  description: "Curated darkness for the modern mystic. Gothic home decor, ritual tools, and wearable art.",
};

export default async function ShopPage({ searchParams }) {
  const [catalogProducts, query] = await Promise.all([getProducts(), searchParams]);

  const products = isShopifyCatalogEnabled() ? catalogProducts : catalogProducts.map((product) => ({
    ...product,
    collections: Object.entries(legacyMemberships).filter(([, handles]) => handles.includes(product.slug || product.handle)).map(([handle]) => ({ handle })),
  }));
  return <><ShopDestinations /><ShopPageClient products={products} initialFilter={query?.category} initialQuery={query?.q} initialCollection={query?.collection} /></>;
}
