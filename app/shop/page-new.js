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
  HOME: ["Home Decor"],
  RITUAL: ["Ritual"],
  ACCESSORIES: ["Accessories"],
  APPAREL: ["Apparel"],
  WALL_ART: ["Wall Art"],
};

// Accessory sub-group order for the Accessories section
const ACCESSORIES_GROUP_ORDER = [
  'Kiss Lock Bags',
  'Socks & Tights',
  'Earrings',
  'Jewelry',
  'Other',
];

/**
 * Classify an Accessories-category product into a display sub-group.
 */
function getAccessoryGroup(product) {
  const name = (product.name || '').toLowerCase();
  const tags = (product.tags || []).map((t) => t.toLowerCase());

  if (tags.includes('bag') || name.includes('kiss lock') || name.includes('kisslock')) return 'Kiss Lock Bags';
  if (tags.includes('socks') || tags.includes('tights') || name.includes('sock') || name.includes('tight')) return 'Socks & Tights';
  if (tags.includes('earring') || name.includes('earring') || name.includes('studs') || name.includes('stud')) return 'Earrings';
  if (tags.includes('jewelry') || tags.includes('necklace') || tags.includes('bracelet') || tags.includes('ring') || name.includes('necklace') || name.includes('bracelet') || name.includes('lariat')) return 'Jewelry';
  return 'Other';
}

/**
 * Sort accessories by sub-group order so bags appear first, then earrings, jewelry, other.
 */
function sortAccessoriesByGroup(products) {
  return [...products].sort((a, b) => {
    const groupA = ACCESSORIES_GROUP_ORDER.indexOf(getAccessoryGroup(a));
    const groupB = ACCESSORIES_GROUP_ORDER.indexOf(getAccessoryGroup(b));
    return groupA - groupB;
  });
}

// Section configuration - matches exact Supabase category values
const SECTIONS = {
  HOME: {
    title: "The Sanctuary",
    subtitle: "Curated pieces to transform your space into a haven of gothic elegance",
    categories: ["Home Decor"],
  },
  RITUAL: {
    title: "The Ritual",
    subtitle: "Tools for transformation, ceremony, and quiet devotion",
    categories: ["Ritual"],
  },
  ACCESSORIES: {
    title: "Adornments",
    subtitle: "Jewelry and accessories for those who move between worlds",
    categories: ["Accessories"],
  },
  APPAREL: {
    title: "The Wardrobe",
    subtitle: "Wearable darkness, crafted for those who move between worlds",
    categories: ["Apparel"],
  },
  WALL_ART: {
    title: "The Gallery",
    subtitle: "Dark art for walls that refuse to be ordinary",
    categories: ["Wall Art"],
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

  const SCROLL_KEY = 'charmed-shop-scroll';

  useEffect(() => {
    // Restore
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      const targetY = parseInt(saved, 10);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: targetY, behavior: 'instant' });
        });
      });
    }

    // Save continuously
    const handleScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [])

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
      WALL_ART: ["WALL_ART"],
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

          // Accessories section: render grouped by subcategory
          if (sectionKey === 'ACCESSORIES') {
            const grouped = sortAccessoriesByGroup(sectionProducts);
            let currentGroup = null;

            return (
              <section key={sectionKey} className="mb-20">
                <SectionHeader
                  title={section.title}
                  subtitle={section.subtitle}
                />
                {ACCESSORIES_GROUP_ORDER.map((groupName) => {
                  const groupProducts = grouped.filter((p) => getAccessoryGroup(p) === groupName);
                  if (groupProducts.length === 0) return null;
                  return (
                    <div key={groupName} className="mb-12 last:mb-0">
                      <p
                        className="mb-5 text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}
                      >
                        {groupName}
                      </p>
                      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                        {groupProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            isMember={isMember}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          }

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
