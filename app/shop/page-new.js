"use client";

import { useEffect, useMemo, useState } from "react";
import ShopHero from "@/components/shop/ShopHero";
import StickyFilterBar from "@/components/shop/StickyFilterBar";
import SectionHeader from "@/components/shop/SectionHeader";
import ProductCard from "@/components/shop/ProductCard";
import { useSanctuaryAccess } from "@/hooks/useSanctuaryAccess";

// Category mapping for filter bar - matches exact Supabase category column values
const CATEGORY_MAP = {
  ALL: null,
  HOME: ["home-decor"],
  RITUAL: ["ritual"],
  ACCESSORIES: ["accessories"],
  APPAREL: ["T-Shirt", "Tank Top", "Hoodie", "Hats"],
};

// Section configuration - matches exact Supabase category values
const SECTIONS = {
  HOME: {
    title: "The Sanctuary",
    subtitle: "Curated pieces to transform your space into a haven of gothic elegance",
    categories: ["home-decor"],
  },
  RITUAL: {
    title: "The Ritual",
    subtitle: "Tools for transformation, ceremony, and quiet devotion",
    categories: ["ritual"],
  },
  ACCESSORIES: {
    title: "Adornments",
    subtitle: "Jewelry and accessories for those who move between worlds",
    categories: ["accessories"],
  },
  APPAREL: {
    title: "The Wardrobe",
    subtitle: "Wearable darkness, crafted for those who move between worlds",
    categories: ["T-Shirt", "Tank Top", "Hoodie", "Hats"],
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
  const { isMember } = useSanctuaryAccess();

  // Filter products based on active filter
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => !p.hidden);

    if (activeFilter !== "ALL") {
      const categories = CATEGORY_MAP[activeFilter];
      if (categories && categories.length > 0) {
        // Case-sensitive exact match
        filtered = filtered.filter((p) => categories.includes(p.category));
      }
    }

    return sortProducts(filtered, sortOption);
  }, [products, activeFilter, sortOption]);

  // Group products by section with empty state safety
  const productsBySection = useMemo(() => {
    const grouped = {};

    Object.entries(SECTIONS).forEach(([key, config]) => {
      // Safe filtering with empty array fallback
      grouped[key] = filteredProducts.filter((p) =>
        config.categories && config.categories.includes(p.category)
      ) || [];
    });

    return grouped;
  }, [filteredProducts]);

  // Determine which sections to show based on active filter
  const visibleSections = useMemo(() => {
    if (activeFilter === "ALL") {
      return Object.keys(SECTIONS);
    }
    
    // Map filter to corresponding section
    const filterToSection = {
      HOME: ["HOME"],
      RITUAL: ["RITUAL"],
      ACCESSORIES: ["ACCESSORIES"],
      APPAREL: ["APPAREL"],
    };
    
    return filterToSection[activeFilter] || [];
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
          const sectionProducts = productsBySection[sectionKey] || [];

          // Skip empty sections
          if (!section || sectionProducts.length === 0) return null;

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
