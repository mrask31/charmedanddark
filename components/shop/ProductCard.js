"use client";

import Link from "next/link";
import { useState } from "react";

function ImageCarousel({ images, productName, isSoldOut, slug }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = images.length > 1;

  function handlePrev(e) {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function handleNext(e) {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
      <Link href={`/shop/${slug}`} className="block h-full w-full">
        <img
          src={images[activeIndex]}
          alt={productName}
          className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${
            isSoldOut ? "grayscale" : ""
          }`}
        />
      </Link>

      {hasMultiple && (
        <>
          {/* Left arrow */}
          <button
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a96e]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#c9a96e]">
              <path d="M7.5 2.5L4 6L7.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a96e]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#c9a96e]">
              <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block h-1.5 w-1.5 rounded-full transition-colors ${
                  i === activeIndex ? "bg-[#c9a96e]" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductCard({ product, isMember }) {
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyStatus, setNotifyStatus] = useState(null);
  const [showNotifyForm, setShowNotifyForm] = useState(false);

  const isSoldOut = product.qty <= 0;
  const publicPrice = product.salePrice || product.price;
  const sanctuaryPrice = publicPrice * 0.9;
  const images = product.imageUrls?.length ? product.imageUrls : [];

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    setNotifyStatus("loading");

    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: notifyEmail,
          product_id: product.id,
        }),
      });

      if (response.ok) {
        setNotifyStatus("success");
        setNotifyEmail("");
        setTimeout(() => {
          setShowNotifyForm(false);
          setNotifyStatus(null);
        }, 2000);
      } else {
        setNotifyStatus("error");
      }
    } catch (error) {
      setNotifyStatus("error");
    }
  };

  return (
    <div className="group relative">
      {/* Image area with carousel — arrows don't trigger navigation */}
      {images.length > 0 ? (
        <ImageCarousel
          images={images}
          productName={product.name}
          isSoldOut={isSoldOut}
          slug={product.slug}
        />
      ) : (
        <Link href={`/shop/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
            <div className="flex h-full w-full items-center justify-center text-zinc-700">
              <span className="text-4xl font-serif">C&D</span>
            </div>
          </div>
        </Link>
      )}

      {/* Product info — always links to detail page */}
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="mt-4 space-y-2">
          <h3 className="font-serif text-lg text-[#F5F0E8]">
            {product.name}
          </h3>

          {!isSoldOut && (
            <div className="space-y-1">
              <div className={`text-sm ${isMember ? 'line-through text-zinc-500' : 'text-white'}`}>
                ${publicPrice.toFixed(2)}
              </div>

              {isMember ? (
                <div className="text-sm text-[#c9a96e] font-medium">
                  ${sanctuaryPrice.toFixed(2)} Sanctuary Price
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <svg className="h-3 w-3 text-[#c9a96e]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#c9a96e]">
                      ${sanctuaryPrice.toFixed(2)} Sanctuary Price
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    Join to unlock
                  </div>
                </div>
              )}

              {product.variantSummary?.length > 0 && (
                <p
                  className="mt-1 text-[11px] uppercase tracking-[0.15em]"
                  style={{ color: '#6B6B6B', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                >
                  {product.variantSummary.map((v) =>
                    `${v.count} ${v.count === 1 ? v.type : v.type + 's'} available`
                  ).join(' · ')}
                </p>
              )}
              {!product.variantSummary?.length && product.hasShopifyOptions && (
                <p
                  className="mt-1 text-[11px] uppercase tracking-[0.15em]"
                  style={{ color: '#6B6B6B', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                >
                  Options available
                </p>
              )}
            </div>
          )}
        </div>
      </Link>

      {isSoldOut && (
        <div className="mt-3">
          {!showNotifyForm ? (
            <button
              onClick={() => setShowNotifyForm(true)}
              className="text-xs text-zinc-400 underline hover:text-white"
            >
              Notify Me
            </button>
          ) : (
            <form onSubmit={handleNotifySubmit} className="space-y-2">
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="Your email"
                required
                className="w-full border-0 border-b border-zinc-700 bg-transparent px-0 py-1 text-xs text-white placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-0"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={notifyStatus === "loading"}
                  className="text-xs text-zinc-400 underline hover:text-white disabled:opacity-50"
                >
                  {notifyStatus === "loading" ? "Sending..." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifyForm(false);
                    setNotifyStatus(null);
                  }}
                  className="text-xs text-zinc-600 hover:text-zinc-400"
                >
                  Cancel
                </button>
              </div>
              {notifyStatus === "success" && (
                <p className="text-xs text-green-500">Subscribed!</p>
              )}
              {notifyStatus === "error" && (
                <p className="text-xs text-red-500">Error. Try again.</p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
