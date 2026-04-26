import { getProducts } from "@/lib/products";
import ShopPageClient from "./page-new";

// Always fetch fresh data — no caching
export const revalidate = 0;

export const metadata = {
  title: "The Atelier",
  description: "Curated darkness for the modern mystic. Gothic home decor, ritual tools, and wearable art.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return <ShopPageClient products={products} />;
}
