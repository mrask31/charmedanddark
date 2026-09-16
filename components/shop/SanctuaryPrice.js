import { formatProductPrice, sanctuaryPricePreview } from '@/lib/product-display';

/** A visible member-price preview; charging and eligibility stay in Shopify/cart. */
export default function SanctuaryPrice({ price, memberBasePrice = null, currency = 'USD', isMember = null, from = false, compact = false }) {
  // Shopify allocates order discounts over bundle components; cent rounding is confirmed in cart.
  if (memberBasePrice != null) return <p className={`text-[#c9a96e] ${compact ? 'text-xs' : 'text-sm'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
    {compact ? 'Sanctuary savings available at checkout' : 'Sanctuary members receive the better eligible offer at checkout. Savings do not stack.'}
  </p>;
  const memberPrice = sanctuaryPricePreview(price, currency);
  if (memberPrice == null) return null;

  return (
    <div className="space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className={`flex flex-wrap items-center gap-x-1.5 text-[#c9a96e] ${compact ? 'text-xs' : 'text-sm'}`}>
        {isMember === false && (
          <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        )}
        <span>{isMember ? 'Your Sanctuary price' : 'Sanctuary price'}</span>
        <span className="font-medium">{from ? 'from ' : ''}{formatProductPrice(memberPrice, currency)}</span>
      </div>
      {!compact && (
        <p className="text-xs text-zinc-400">
          {isMember ? 'Your 10% member savings · applied in cart' : '10% off with Sanctuary membership'}
        </p>
      )}
    </div>
  );
}
