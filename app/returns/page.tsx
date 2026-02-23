import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/config/site';

/**
 * Returns & Exchanges Page
 * Strict Monochromatic Brutalism
 */

export const metadata: Metadata = {
  title: 'Returns & Exchanges | Charmed & Dark',
  description: 'Objects from Charmed & Dark are curated for longevity. 30-day return window for all new, unused products.',
  alternates: {
    canonical: getCanonicalUrl('/returns'),
  },
  openGraph: {
    title: 'Returns & Exchanges | Charmed & Dark',
    description: 'Objects from Charmed & Dark are curated for longevity. 30-day return window for all new, unused products.',
    url: getCanonicalUrl('/returns'),
    siteName: 'Charmed & Dark',
    type: 'website',
  },
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Maximum white space container */}
      <div className="container mx-auto px-8 py-24 md:py-32 max-w-3xl">
        {/* Single-column, center-aligned layout */}
        <div className="space-y-16">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.1em] text-center uppercase">
            Returns & Exchanges
          </h1>

          {/* Body Section */}
          <section className="space-y-8">
            <p className="text-base md:text-lg leading-relaxed text-gray-900 relative pl-0 hover:pl-6 transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-black before:scale-y-0 before:origin-top before:transition-transform before:duration-[400ms] before:ease-[cubic-bezier(0.4,0,0.2,1)] hover:before:scale-y-100">
              Objects from Charmed & Dark are curated for longevity. If an item does not meet your spatial requirements, we offer a 30-day return window for all new, unused products.
            </p>
          </section>

          {/* Process Section */}
          <section className="border-t border-black pt-16 space-y-8">
            <h2 className="text-xs uppercase tracking-widest text-gray-600 font-light">
              Process
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-gray-900 relative pl-0 hover:pl-6 transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-black before:scale-y-0 before:origin-top before:transition-transform before:duration-[400ms] before:ease-[cubic-bezier(0.4,0,0.2,1)] hover:before:scale-y-100">
              All returns are handled via mail. No restocking fees. Your refund will be processed within 7 business days of receipt.
            </p>
          </section>

          {/* Sanctuary Integration */}
          <section className="border-t border-black pt-16">
            <div className="bg-gray-50 border border-gray-200 p-8 md:p-12">
              <p className="text-sm md:text-base leading-relaxed text-gray-800 relative pl-0 hover:pl-6 transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-black before:scale-y-0 before:origin-top before:transition-transform before:duration-[400ms] before:ease-[cubic-bezier(0.4,0,0.2,1)] hover:before:scale-y-100">
                Sanctuary Members receive priority concierge support for all exchanges.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="border-t border-black pt-16 space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-gray-600 font-light">
              Contact
            </h2>
            <p className="text-sm text-gray-700 relative pl-0 hover:pl-6 transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-black before:scale-y-0 before:origin-top before:transition-transform before:duration-[400ms] before:ease-[cubic-bezier(0.4,0,0.2,1)] hover:before:scale-y-100">
              For return inquiries, contact us with your order number and reason for return.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
