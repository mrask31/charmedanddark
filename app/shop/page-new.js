"use client";

import { useEffect, useMemo, useState } from "react";
import ShopHero from "@/components/shop/ShopHero";
import StickyFilterBar from "@/components/shop/StickyFilterBar";
import SectionHeader from "@/components/shop/SectionHeader";
import ProductCard from "@/components/shop/ProductCard";
import { isMember } from "@/lib/membership";

// Category mapping for filter bar - matches actual Supabase category column values
const CATEGORY_MAP = {
  ALL: null,
  APPAREL: ["T-Shirt", "Tank Top"],
  HOME: [], // No home products yet
  ACCESSORIES: [], // No accessories yet
  RITUAL: [], // No ritual products yet
};

// Section configuration - matches actual Supabase category values
const SECTIONS = {
  APPAREL: {
    title: "The Wardrobe",
    subtitle: "Wearable darkness, crafted for those who move between worlds",
    categories: ["T-Shirt", "Tank Top"],
  },
  UNCATEGORIZED: {
    title: "The Collection",
    subtitle: "Curated pieces for the modern mystic",
    categories: [null], // Products with NULL category
  },
};

function getEffectivePrice(product) {
  return product.salePrice || product.price;
}

function sortProducts(products, sortOption) {
  const sorted = [...products];
  
  switch (sortOption) {
    case "Price: Low to High":
      return sorted.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    case "Price: High to Low":
      return sorted.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    case "Newest":
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case "Featured":
    default:
      return sorted;
  }
}

export default function ShopPageClient({ products }) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("Featured");

  // Filter products based on active filter
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => !p.hidden);

    if (activeFilter !== "ALL") {
      const categories = CATEGORY_MAP[activeFilter];
      if (categories && categories.length > 0) {
        filtered = filtered.filter((p) => categories.includes(p.category));
      }
    }

    return sortProducts(filtered, sortOption);
  }, [products, activeFilter, sortOption]);

  // Group products by section
  const productsBySection = useMemo(() => {
    const grouped = {};

    Object.entries(SECTIONS).forEach(([key, config]) => {
      grouped[key] = filteredProducts.filter((p) =>
        config.categories.includes(p.category)
      );
    });

    return grouped;
  }, [filteredProducts]);

  // Determine which sections to show based on active filter
  const visibleSections = useMemo(() => {
    if (activeFilter === "ALL") {
      return Object.keys(SECTIONS);
    }
    
    if (activeFilter === "APPAREL") return ["APPAREL"];
    if (activeFilter === "HOME") return ["HOME"];
    if (activeFilter === "ACCESSORIES") return ["ACCESSORIES"];
    if (activeFilter === "RITUAL") return ["RITUAL"];
    
    return [];
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-black">
      <ShopHero />
      
      <StickyFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      <div className="mx-auto max-w-7xl px-6 py-16">
        {visibleSections.map((sectionKey) => {
          const section = SECTIONS[sectionKey];
          const sectionProducts = productsBySection[sectionKey];

          if (sectionProducts.length === 0) return null;

          return (
            <section key={sectionKey} className="mb-20">
              <SectionHeader
                title={section.title}
                subtitle={section.subtitle}
              />
              
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {sectionProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isMember={isMember}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-zinc-500">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
