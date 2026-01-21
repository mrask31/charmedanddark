const formatCurrency = (value, currency = "USD") => {
  if (value === null || Number.isNaN(value)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
};

const getPublicPrice = (price, salePrice) => {
  if (salePrice && salePrice < price) {
    return salePrice;
  }
  return price;
};

export default function TwoPrice({
  price,
  salePrice,
  currency = "USD",
  isMember = false,
  showGate = true,
  variant = "default",
}) {
  const publicPrice = getPublicPrice(price, salePrice);
  const sanctuaryPrice = publicPrice ? publicPrice * 0.9 : null;
  const isCompact = variant === "compact";

  return (
    <div className={isCompact ? "space-y-1" : "space-y-2"}>
      <div className="flex flex-wrap items-baseline gap-2 text-sm">
        <span className="text-xs uppercase tracking-[0.3em] text-white/50">
          Public
        </span>
        <span className="text-base font-medium text-white">
          {formatCurrency(publicPrice, currency)}
        </span>
        {salePrice && salePrice < price ? (
          <span className="text-xs text-white/40 line-through">
            {formatCurrency(price, currency)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-baseline gap-2 text-sm">
        <span className="text-xs uppercase tracking-[0.3em] text-white/50">
          Sanctuary
        </span>
        <span className="text-base font-semibold text-white">
          {formatCurrency(sanctuaryPrice, currency)}
        </span>
        <span className="text-xs text-white/50">(-10%)</span>
      </div>
      {!isMember && showGate ? (
        <p className="text-xs text-white/50">
          Join the Sanctuary to unlock Sanctuary Price.
        </p>
      ) : null}
    </div>
  );
}

export { formatCurrency, getPublicPrice };
