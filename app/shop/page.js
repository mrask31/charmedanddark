import { getProducts } from "@/lib/products-csv";
import ShopContent from "@/components/ShopContent";

export const metadata = {
  title: "Shop Gothic Home Decor",
  description: "A curated boutique of dark home décor designed for quiet ritual and refined presence—crafted to feel timeless, tactile, and rare.",
};

export default async function ShopPage() {
  const products = await getProducts();
  
  return <ShopContent products={products} />;
}
