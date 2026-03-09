import { getProducts, getProductBySlug } from "@/lib/products";
import { notFound } from "next/navigation";
import ProductDetailContent from "@/components/ProductDetailContent";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) return { title: "Product Not Found" };
  
  return {
    title: product.name,
    description: product.description?.slice(0, 160)
      || "Discover this artifact at Charmed & Dark.",
    openGraph: {
      title: product.name + " | Charmed & Dark",
      description: product.description?.slice(0, 160),
      images: product.imageUrls?.[0]
        ? [{ url: product.imageUrls[0], width: 800, height: 800 }]
        : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) return notFound();
  
  return <ProductDetailContent product={product} />;
}
