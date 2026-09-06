"use client";

import { useEffect, useMemo, useState } from "react";
import ShopHero from "@/components/shop/ShopHero";
import StickyFilterBar from "@/components/shop/StickyFilterBar";
import SectionHeader from "@/components/shop/SectionHeader";
import ProductCard from "@/components/shop/ProductCard";
import { productInCollection, productPricing } from "@/lib/product-display";
import { useSanctuaryAccess } from "@/hooks/useSanctuaryAccess";

// Category mapping for filter bar - matches the normalized public catalog categories
const CATEGORY_MAP = {
  ALL: null,
  ON_SALE: "__sale__",  // Special: filters products with salePrice set
  SGG: null,
  ACCESSORIES: ["Accessories"],
  RITUAL: ["Ritual"],
  HOME: ["Home Decor"],
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

function isSmuttyGoodGirlProduct(product) {
  return productInCollection(product, 'smutty-good-girl') || product.collection === 'smutty-good-girl';
}

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

// Section configuration - matches the normalized public catalog categories
const SECTIONS = {
  SGG: {
    title: "Smutty Good Girl",
    subtitle: "Bookish drinkware, totes, and everyday essentials for readers with questionable bookmarks",
    categories: [],
  },
  ACCESSORIES: {
    title: "Adornments",
    subtitle: "Kiss lock bags, jewelry, and accessories for those who move between worlds",
    categories: ["Accessories"],
  },
  RITUAL: {
    title: "Light the Darkness",
    subtitle: "Candles, holders, and ritual tools for ceremony and quiet devotion",
    categories: ["Ritual"],
  },
  HOME: {
    title: "Dark Home",
    subtitle: "Curated pieces to transform your space into a haven of gothic elegance",
    categories: ["Home Decor"],
  },
  APPAREL: {
    title: "The Wardrobe",
    subtitle: "Wearable darkness, crafted for those who move between worlds",
    categories: ["Apparel"],
  },
  OTHER: {
    title: "More to Discover",
    subtitle: "Explore the rest of the collection",
    categories: [],
  },
  WALL_ART: {
    title: "The Gallery",
    subtitle: "Dark art for walls that refuse to be ordinary",
    categories: ["Wall Art"],
  },
};

function getEffectivePrice(product) {
  return productPricing(product).publicPrice;
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

export default function ShopPageClient({ products, initialFilter, initialQuery, initialCollection }) {
  const [activeFilter, setActiveFilter] = useState(Object.hasOwn(CATEGORY_MAP, initialFilter) ? initialFilter : "ALL");
  const [searchQuery, setSearchQuery] = useState(typeof initialQuery === "string" ? initialQuery : "");
  const [collectionFilter, setCollectionFilter] = useState(typeof initialCollection === "string" ? initialCollection : "");
  const [sortOption, setSortOption] = useState("Featured");
  const { isMember } = useSanctuaryAccess();

  // Check if any products are on sale (promotion engine enriched them)
  const hasOnSale = useMemo(() => products.some((p) => productPricing(p).isOnSale), [products]);

  // Preserve shareable filters without triggering a catalog refetch per keypress.
  useEffect(() => {
    const url = new URL(window.location.href);
    activeFilter === 'ALL' ? url.searchParams.delete('category') : url.searchParams.set('category', activeFilter);
    searchQuery ? url.searchParams.set('q', searchQuery) : url.searchParams.delete('q');
    collectionFilter ? url.searchParams.set('collection', collectionFilter) : url.searchParams.delete('collection');
    window.history.replaceState(null, '', url);
  }, [activeFilter, searchQuery, collectionFilter]);

  const changeFilter = (filter) => {
    setActiveFilter(filter);
    setCollectionFilter('');
  };
  const resetFilters = () => {
    changeFilter('ALL');
    setSearchQuery('');
  };

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
  }, []);

  // Filter products based on active filter
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => !p.hidden);

    if (activeFilter === "ON_SALE") {
      // Special filter: only products with an active sale price
      filtered = filtered.filter((p) => productPricing(p).isOnSale);
    } else if (activeFilter === "SGG") {
      filtered = filtered.filter(isSmuttyGoodGirlProduct);
    } else if (activeFilter !== "ALL") {
      const categories = CATEGORY_MAP[activeFilter];
      if (categories && categories.length > 0) {
        // Case-sensitive exact match
        filtered = filtered.filter((p) => categories.includes(p.category));
      }
    }

    if (collectionFilter) filtered = filtered.filter((p) => productInCollection(p, collectionFilter) || p.collection === collectionFilter);
    const query = searchQuery.trim().toLocaleLowerCase();
    if (query) filtered = filtered.filter((p) => [p.name, p.category, ...(p.tags || [])].join(' ').toLocaleLowerCase().includes(query));
    return sortProducts(filtered, sortOption);
  }, [products, activeFilter, sortOption, searchQuery, collectionFilter]);

  // Group products by section with empty state safety
  const productsBySection = useMemo(() => {
    const grouped = {};

    Object.entries(SECTIONS).forEach(([key, config]) => {
      if (key === 'SGG') {
        grouped[key] = ["ALL", "ON_SALE", "SGG"].includes(activeFilter) ? filteredProducts.filter(isSmuttyGoodGirlProduct) : [];
        return;
      }

      const isCategoryFilter = !['ALL', 'ON_SALE', 'SGG'].includes(activeFilter);
      const candidates = filteredProducts.filter((p) => isCategoryFilter || !isSmuttyGoodGirlProduct(p));
      grouped[key] = key === 'OTHER'
        ? candidates.filter((p) => !Object.values(CATEGORY_MAP).some((categories) => Array.isArray(categories) && categories.includes(p.category)))
        : candidates.filter((p) => config.categories?.includes(p.category));
    });

    return grouped;
  }, [filteredProducts, activeFilter]);

  // Determine which sections to show based on active filter
  const visibleSections = useMemo(() => {
    if (activeFilter === "ALL" || activeFilter === "ON_SALE") {
      return Object.keys(SECTIONS);
    }
    
    // Map filter to corresponding section
    const filterToSection = {
      SGG: ["SGG"],
      ACCESSORIES: ["ACCESSORIES"],
      RITUAL: ["RITUAL"],
      HOME: ["HOME"],
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
        onFilterChange={changeFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
        hasOnSale={hasOnSale}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={filteredProducts.length}
      />

      <div className="mx-auto max-w-7xl px-6 py-16" id="shop-results">
        {collectionFilter && <div className="mb-8 flex items-center gap-4 text-sm text-zinc-300"><span>Collection: {collectionFilter.replaceAll('-', ' ')}</span><button type="button" onClick={() => setCollectionFilter('')} className="underline">Clear collection</button></div>}
        {visibleSections.map((sectionKey) => {
          const section = SECTIONS[sectionKey];
          const sectionProducts = productsBySection[sectionKey] || [];

          // Skip empty sections
          if (!section || sectionProducts.length === 0) return null;

          // Accessories section: render grouped by subcategory
          if (sectionKey === 'ACCESSORIES') {
            const grouped = sortAccessoriesByGroup(sectionProducts);

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
            <p className="text-zinc-400">No products match these filters.</p>
            <button type="button" onClick={resetFilters} className="mt-5 border border-[#c9a96e] px-6 py-3 text-sm text-[#c9a96e]">View all products</button>
          </div>
        )}
      </div>
    </div>
  );
}
