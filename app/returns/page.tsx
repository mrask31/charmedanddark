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
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-center uppercase letter-spacing-wide">
            Returns & Exchanges
          </h1>

          {/* Body Section */}
          <section className="space-y-8">
            <p className="text-base md:text-lg leading-relaxed text-gray-900 architectural-hover">
              Objects from Charmed & Dark are curated for longevity. If an item does not meet your spatial requirements, we offer a 30-day return window for all new, unused products.
            </p>
          </section>

          {/* Process Section */}
          <section className="border-t border-black pt-16 space-y-8">
            <h2 className="text-xs uppercase tracking-widest text-gray-600 font-light">
              Process
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-gray-900 architectural-hover">
              All returns are handled via mail. No restocking fees. Your refund will be processed within 7 business days of receipt.
            </p>
          </section>

          {/* Sanctuary Integration */}
          <section className="border-t border-black pt-16">
            <div className="bg-gray-50 border border-gray-200 p-8 md:p-12">
              <p className="text-sm md:text-base leading-relaxed text-gray-800 architectural-hover">
                Sanctuary Members receive priority concierge support for all exchanges.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="border-t border-black pt-16 space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-gray-600 font-light">
              Contact
            </h2>
            <p className="text-sm text-gray-700 architectural-hover">
              For return inquiries, contact us with your order number and reason for return.
            </p>
          </section>
        </div>
      </div>

      <style jsx>{`
        .letter-spacing-wide {
          letter-spacing: 0.1em;
        }

        .architectural-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .architectural-hover::before {
          content: '';
          position: absolute;
          left: -16px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: black;
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .architectural-hover:hover::before {
          transform: scaleY(1);
        }

        .architectural-hover:hover {
          padding-left: 8px;
          color: #000;
        }
      `}</style>
    </div>
  );
}
