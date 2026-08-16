"use client";

import { createContext, useContext, useMemo } from 'react';

const ProductPromotionContext = createContext({
  isOnSale: false,
  salePercentage: null,
});

export function ProductPromotionProvider({ product, children }) {
  const value = useMemo(() => {
    const retailPrice = Number(product?.price || 0);
    const salePrice = product?.salePrice != null ? Number(product.salePrice) : null;
    const isOnSale =
      retailPrice > 0 &&
      salePrice != null &&
      salePrice > 0 &&
      salePrice < retailPrice;

    const salePercentage = isOnSale
      ? Math.round(
          Number(product?.salePercentage) ||
            ((retailPrice - salePrice) / retailPrice) * 100
        )
      : null;

    return { isOnSale, salePercentage };
  }, [product?.price, product?.salePrice, product?.salePercentage]);

  return (
    <ProductPromotionContext.Provider value={value}>
      {children}
    </ProductPromotionContext.Provider>
  );
}

export function useProductPromotion() {
  return useContext(ProductPromotionContext);
}
