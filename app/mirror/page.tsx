'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getReadingForState, 
  getStateLabel, 
  getAllStates,
  type EmotionalState,
  type MirrorReading 
} from '@/lib/mirrorReadings';
import { getProductBySlug } from '@/lib/products';
import { getApparelBySlug, formatPrice } from '@/lib/apparel';

export default function MirrorPage() {
  const [selectedState, setSelectedState] = useState<EmotionalState | null>(null);
  const [reading, setReading] = useState<MirrorReading | null>(null);
  const [isSanctuary, setIsSanctuary] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    // Check sanctuary status on mount
    if (typeof window !== 'undefined') {
      setIsSanctuary(localStorage.getItem('sanctuary_preview') === 'true');
    }
  }, []);

  const handleLookIntoMirror = () => {
    if (!selectedState) return;

    // Get a reading for the selected state
    const newReading = getReadingForState(selectedState);
    
    // Trigger reveal animation
    setIsRevealing(true);
    setReading(newReading);
  };

  // Get product or apparel details
  const getObjectDetails = (slug: string) => {
    const product = getProductBySlug(slug);
    if (product) {
      return {
        name: product.name,
        link: `/product/${slug}`,
        pricePublic: product.pricePublic,
        priceSanctuary: product.priceSanctuary,
        image: product.images[0]
      };
    }

    const apparel = getApparelBySlug(slug);
    if (apparel) {
      return {
        name: apparel.name,
        link: `/uniform/${slug}`,
        pricePublic: apparel.pricePublic,
        priceSanctuary: apparel.priceSanctuary,
        image: apparel.images[0]
      };
    }

    return null;
  };

  const objectDetails = reading ? getObjectDetails(reading.productSlug) : null;
  const allStates = getAllStates();

  return (
    <div className="mirror-page">
      <div className="mirror-container">
        {/* Header */}
        <div className="mirror-header">
          <h1 className="mirror-title">The Mirror</h1>
          <p className="mirror-subhead">A private place to pause.</p>
          <div className="mirror-intro">
            <p>The Mirror does not fix.</p>
            <p>It reflects.</p>
            <p>You may leave at any time.</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="mirror-input-section">
          <label className="mirror-label">How do you feel?</label>
          
          <div className="mirror-states">
            {allStates.map(state => (
              <button
                key={state}
                className={`mirror-state-button ${selectedState === state ? 'selected' : ''}`}
                onClick={() => setSelectedState(state)}
                aria-pressed={selectedState === state}
              >
                {getStateLabel(state)}
              </button>
            ))}
          </div>

          <button
            className="mirror-submit"
            onClick={handleLookIntoMirror}
            disabled={!selectedState}
          >
            Look into the Mirror
          </button>
        </div>

        {/* Reading Card */}
        {reading && objectDetails && (
          <div className={`mirror-reading-card ${isRevealing ? 'revealing' : ''}`}>
            {/* Validation */}
            <div className="reading-validation">
              <p>{reading.validation}</p>
            </div>

            {/* Reflection */}
            <div className="reading-reflection">
              <p>{reading.reflection}</p>
            </div>

            {/* Object Suggestion */}
            <div className="reading-object">
              <h3 className="reading-object-heading">An object for this moment</h3>
              
              <Link href={objectDetails.link} className="reading-object-card">
                {objectDetails.image && (
                  <div className="reading-object-image">
                    <img src={objectDetails.image} alt={objectDetails.name} />
                  </div>
                )}
                <div className="reading-object-info">
                  <p className="reading-object-name">{objectDetails.name}</p>
                  <div className="reading-object-pricing">
                    {isSanctuary ? (
                      <span className="reading-price sanctuary">
                        {formatPrice(objectDetails.priceSanctuary)}
                      </span>
                    ) : (
                      <>
                        <span className="reading-price public">
                          {formatPrice(objectDetails.pricePublic)}
                        </span>
                        <span className="reading-price-separator">·</span>
                        <span className="reading-price sanctuary">
                          {formatPrice(objectDetails.priceSanctuary)} Sanctuary
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </div>

            {/* Ritual Suggestion */}
            <div className="reading-ritual">
              <p>{reading.ritualSuggestion}</p>
            </div>

            {/* CTA */}
            <div className="reading-cta">
              {isSanctuary ? (
                <button 
                  className="reading-cta-button disabled"
                  disabled
                  title="Coming soon"
                >
                  Keep this in the Grimoire
                </button>
              ) : (
                <Link href="/join" className="reading-cta-link">
                  Enter the Sanctuary to keep reflections
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
