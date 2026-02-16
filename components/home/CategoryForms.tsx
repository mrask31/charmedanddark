import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
  { 
    name: 'T-Shirts', 
    handle: 'tees', 
    image: '/images/Female_tshirt.png' 
  },
  { 
    name: 'Hoodies', 
    handle: 'hoodies', 
    image: '/images/Female_signature_hoodie.png' 
  },
  { 
    name: 'Headwear', 
    handle: 'headwear', 
    image: '/images/female_beanie.png' 
  },
  { 
    name: 'Accessories', 
    handle: 'accessories', 
    image: '/images/female_beanie_white.png' 
  },
];

export default function CategoryForms() {
  return (
    <section className="category-section">
      <div className="category-header">
        <h2 className="category-title">Choose your form</h2>
        <p className="category-subtitle">
          Same language, different silhouettes.
        </p>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((category) => (
          <Link
            href={`/collections/${category.handle}`}
            key={category.handle}
            className="category-form-card"
          >
            <div className="category-form-image">
              <Image
                src={category.image}
                alt={category.name}
                width={300}
                height={400}
                loading="lazy"
              />
            </div>
            <div className="category-form-overlay">
              <h3 className="category-form-name">{category.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
