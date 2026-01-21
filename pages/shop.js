import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getProducts } from "@/lib/products";
import TwoPrice from "@/components/TwoPrice";
import { isMember } from "@/lib/membership";

const categoryOptions = [
  "All Categories",
  "Drinkware",
  "Dining & Serveware",
  "Candles & Scent",
  "Wall Art",
  "Decor Objects",
  "Textiles",
  "Home Decor (Other)",
];

const tabs = [
  "All",
  "Apparel (Coming Soon)",
  "Home Decor",
  "Drops (Coming Soon)",
];

const collectionConfigs = {
  bestSellers: {
    label: "Best Sellers",
    description:
      "A curated selection of high-demand pieces, limited in stock and rich in ritual.",
  },
  giftsUnder30: {
    label: "Gifts Under $30",
    description:
      "Small offerings with gothic charm, ready for gifting or quiet indulgence.",
  },
};

const getEffectivePrice = (product) => {
  if (product.salePrice && product.salePrice < product.price) {
    return product.salePrice;
  }
  return product.price;
};

export async function getStaticProps() {
  const products = getProducts();
  return { props: { products } };
}

export default function Shop({ products }) {
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("Home Decor");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("Featured");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [activeCollection, setActiveCollection] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!activeProduct) {
      return undefined;
    }

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    const focusable = modalRef.current?.querySelectorAll(
      'a,button,textarea,input,select,[tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    first?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveProduct(null);
      }

      if (event.key === "Tab" && focusable?.length) {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [activeProduct]);

  const visibleProducts = useMemo(() => {
    const base = products.filter((product) => !product.hidden);
    let filtered = base;

    if (activeTab === "Home Decor") {
      filtered = base;
    }

    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term)
      );
    }

    if (inStockOnly) {
      filtered = filtered.filter((product) => product.qty > 0);
    }

    if (activeCollection === "bestSellers") {
      const inStock = base.filter(
        (product) => product.qty > 0 && !product.hidden
      );
      const byPrice = [...inStock].sort((a, b) => b.price - a.price);
      const saleItems = inStock.filter(
        (product) => product.salePrice && product.salePrice < product.price
      );
      const curated = [];
      byPrice.slice(0, 6).forEach((item) => curated.push(item));
      saleItems.slice(0, 4).forEach((item) => {
        if (!curated.find((entry) => entry.sku === item.sku)) {
          curated.push(item);
        }
      });
      filtered = curated.slice(0, 12);
    }

    if (activeCollection === "giftsUnder30") {
      filtered = filtered.filter((product) => {
        const price = getEffectivePrice(product);
        return price <= 30 && product.qty > 0;
      });
    }

    if (sortOption === "Price: Low to High") {
      filtered = [...filtered].sort(
        (a, b) => getEffectivePrice(a) - getEffectivePrice(b)
      );
    }

    if (sortOption === "Price: High to Low") {
      filtered = [...filtered].sort(
        (a, b) => getEffectivePrice(b) - getEffectivePrice(a)
      );
    }

    if (sortOption === "Featured" || sortOption === "Newest") {
      filtered = [...filtered].sort((a, b) => a.index - b.index);
    }

    return filtered;
  }, [
    activeCollection,
    activeTab,
    inStockOnly,
    products,
    searchQuery,
    selectedCategory,
    sortOption,
  ]);

  const handleCollectionToggle = (collectionKey) => {
    setActiveCollection((current) =>
      current === collectionKey ? null : collectionKey
    );
  };

  const FiltersPanel = ({ isMobile }) => (
    <div
      className={
        isMobile ? "space-y-4" : "grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]"
      }
    >
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
        Search
        <input
          type="text"
          placeholder="Search the atelier"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="rounded-full border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        />
      </label>
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
        Category
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="rounded-full border border-white/15 bg-black px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          {categoryOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
        Sort
        <select
          value={sortOption}
          onChange={(event) => setSortOption(event.target.value)}
          className="rounded-full border border-white/15 bg-black px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          {[
            "Featured",
            "Price: Low to High",
            "Price: High to Low",
            "Newest",
          ].map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <div className="flex flex-col justify-end gap-3">
        <label className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/50">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => setInStockOnly(event.target.checked)}
            className="h-4 w-4 rounded border border-white/20 bg-black text-white/80"
          />
          In Stock Only
        </label>
        {isMobile ? (
          <button
            type="button"
            onClick={() => setIsFilterOpen(false)}
            className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-white/40 hover:text-white"
          >
            Apply Filters
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <section className="space-y-10">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">Shop</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Shop Gothic Home Decor
        </h1>
        <p className="max-w-2xl text-base leading-7 text-white/70">
          A curated boutique of dark home décor designed for quiet ritual and
          refined presence—crafted to feel timeless, tactile, and rare.
        </p>
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-4 py-2 transition ${
                activeTab === tab
                  ? "border-white/40 text-white"
                  : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Shop by Category</h2>
        <div className="hidden md:block">
          <FiltersPanel />
        </div>
        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-white/40 hover:text-white md:hidden"
        >
          Filter
        </button>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Featured Collections</h2>
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
          {Object.entries(collectionConfigs).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleCollectionToggle(key)}
              className={`rounded-full border px-4 py-2 transition ${
                activeCollection === key
                  ? "border-white/40 text-white"
                  : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
        {activeCollection ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {collectionConfigs[activeCollection].label}
            </p>
            <p className="mt-2">{collectionConfigs[activeCollection].description}</p>
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Results</h2>
        {(activeTab === "Apparel (Coming Soon)" ||
          activeTab === "Drops (Coming Soon)") ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Coming Soon
            </p>
            <p className="mt-2">
              These releases are being prepared for the Threshold. The Sanctuary
              receives early access when they arrive.
            </p>
            <Link
              href="/join"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-5 py-2 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md"
            >
              Enter the Sanctuary
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => {
              const isSoldOut = product.qty <= 0;
              const previewImage = product.imageUrls?.[0];

              return (
                <button
                  key={product.sku}
                  type="button"
                  onClick={() => setActiveProduct(product)}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-white/25"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
                    <span>{product.category}</span>
                    <span>{isSoldOut ? "Sold Out" : "In Stock"}</span>
                  </div>
                  <div className="mt-4 h-32 overflow-hidden rounded-xl border border-white/10 bg-black/60">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/40">
                        C&amp;D
                      </div>
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-medium text-white">
                    {product.name}
                  </h3>
                  <div className="mt-3">
                    <TwoPrice
                      price={product.price}
                      salePrice={product.salePrice}
                      currency={product.currency}
                      isMember={isMember}
                      showGate
                      variant="compact"
                    />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/40">
                    Quick View
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-white/10 pt-6 text-xs uppercase tracking-[0.35em] text-white/40">
        <div className="flex flex-wrap gap-6">
          <Link href="/shop">Gothic Apparel</Link>
          <Link href="/shop">Gothic Home Decor</Link>
          <Link href="/drops">Limited Drops</Link>
        </div>
      </footer>

          {activeProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setActiveProduct(null)}
          />
          <div
            ref={modalRef}
            className="modal-surface relative w-full max-w-xl rounded-2xl border border-white/15 bg-black p-6 text-white shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setActiveProduct(null)}
              aria-label="Close quick view"
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-xs text-white/70 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              ✕
            </button>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    {activeProduct.category}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">
                    {activeProduct.name}
                  </h3>
                  <p className="mt-2 text-sm text-white/70">
                    {activeProduct.description}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <TwoPrice
                  price={activeProduct.price}
                  salePrice={activeProduct.salePrice}
                  currency={activeProduct.currency}
                  isMember={isMember}
                  showGate
                />
                {!isMember ? (
                  <Link
                    href="/join"
                    className="mt-3 inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white"
                  >
                    Join the Sanctuary
                  </Link>
                ) : null}
              </div>

              <div className="relative mt-5 h-64 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/10 via-black/40 to-black/80 sm:h-72">
                {activeProduct.imageUrls?.[0] ? (
                  <img
                    src={activeProduct.imageUrls[0]}
                    alt={activeProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-white/10">
                      C&amp;D
                    </div>
                    <div className="absolute bottom-3 right-4 text-[10px] uppercase tracking-[0.4em] text-white/40">
                      Preview Image
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/product/${activeProduct.slug}`}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 shadow-sm transition hover:-translate-y-0.5 hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  View Full Details
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveProduct(null)}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isFilterOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm md:hidden">
          <div className="w-full rounded-t-3xl border border-white/10 bg-black p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Filters
              </p>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="text-xs uppercase tracking-[0.3em] text-white/60"
              >
                Close
              </button>
            </div>
            <div className="mt-4">
              <FiltersPanel isMobile />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
