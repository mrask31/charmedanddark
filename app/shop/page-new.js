"use client";

import { useEffect, useMemo, useState } from "react";
import ShopHero from "@/components/shop/ShopHero";
import StickyFilterBar from "@/components/shop/StickyFilterBar";
import SectionHeader from "@/components/shop/SectionHeader";
import ProductCard from "@/components/shop/ProductCard";
import { isMember } from "@/lib/membership";

// Category mapping for filter bar
const CATEGORY_MAP = {
  ALL: null,
  HOME: ["home-decor"],
  APPAREL: ["apparel"],
  ACCESSORIES: ["accessories"],
  RITUAL: ["ritual"],
};

// Section configuration
const SECTIONS = {
  RITUAL: {
    title: "The Ritual",
    subtitle: "Tools for transformation, ceremony, and quiet devotion",
    categories: ["ritual"],
  },
  WARDROBE: {
    title: "The Wardrobe",
    subtitle: "Wearable darkness, crafted for those who move between worlds",
    categories: ["apparel", "accessories"],
  },
  HOME: {
    title: "The Sanctuary",
    subtitle: "Curated pieces to transform your space into a haven of gothic elegance",
    categories: ["home-decor"],
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
    let filtered = products.filter((p) => !p.hidden && p.qty > 0);

    if (activeFilter !== "ALL") {
      const categories = CATEGORY_MAP[activeFilter];
      if (categories) {
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
    
    if (activeFilter === "RITUAL") return ["RITUAL"];
    if (activeFilter === "APPAREL" || activeFilter === "ACCESSORIES") return ["WARDROBE"];
    if (activeFilter === "HOME") return ["HOME"];
    
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
