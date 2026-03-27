import { getProducts } from "@/lib/products";
import ShopPageClient from "./page-new";
import ShopScrollRestore from "./ShopScrollRestore";

// ISR: Revalidate every hour to keep product data fresh
export const revalidate = 3600;

export const metadata = {
  title: "The Atelier",
  description: "Curated darkness for the modern mystic. Gothic home decor, ritual tools, and wearable art.",
};

export default async function ShopPage() {
  const products = await getProducts();
  
  return (
    <>
      <ShopScrollRestore />
      <ShopPageClient products={products} />
    </>
  );
}
