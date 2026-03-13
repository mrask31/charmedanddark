import { getProducts } from "@/lib/products";
import ShopContent from "@/components/ShopContent";

export const metadata = {
  title: "Shop Gothic Home Decor",
  description: "A curated boutique of dark home décor designed for quiet ritual and refined presence—crafted to feel timeless, tactile, and rare.",
};

export default async function ShopPage() {
  const products = await getProducts();
  
  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-6 md:pb-12">
      <ShopContent products={products} />
    </div>
  );
}
