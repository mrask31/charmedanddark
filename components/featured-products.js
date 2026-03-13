"use client";

import Link from "next/link";
import Image from "next/image";

const products = [
  {
    id: 1,
    name: "Graveyard Ballerina Crop Tee",
    price: "$45",
    sanctuaryPrice: "$38",
    image: "/images/homepage/product-1.png",
  },
  {
    id: 2,
    name: "Till Death Unisex Tee",
    price: "$42",
    sanctuaryPrice: "$36",
    image: "/images/homepage/product-2.png",
  },
  {
    id: 3,
    name: "The Charmed & Dark Signature Hoodie",
    price: "$85",
    sanctuaryPrice: "$72",
    image: "/images/homepage/product-3.png",
  },
  {
    id: 4,
    name: "White Gothic Beanie",
    price: "$32",
    sanctuaryPrice: "$27",
    image: "/images/homepage/product-4.jpg",
  },
];

export function FeaturedProducts() {
  return (
    <section className="bg-black px-8 py-24 lg:px-16">
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-[#B89C6D]">
          Curated Selections
        </span>
        <Link
          href="/shop"
          className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
        >
          View All
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Link key={product.id} href="/shop" className="group">
            <div className="relative aspect-[3/4] overflow-hidden border border-transparent transition-colors duration-160 group-hover:border-[#B89C6D]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-white">{product.name}</h3>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-sm text-zinc-400">{product.price}</span>
                <span className="text-xs uppercase tracking-wider text-[#B89C6D]">
                  Sanctuary {product.sanctuaryPrice}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
