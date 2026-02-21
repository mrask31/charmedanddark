'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryFilterProps {
  categories: string[];
  currentCategory?: string;
}

export default function CategoryFilter({ categories, currentCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    
    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : window.location.pathname);
  };

  return (
    <aside style={styles.sidebar}>
      <h3 style={styles.title}>Filter</h3>
      
      <nav style={styles.nav}>
        <button
          onClick={() => handleCategoryClick('all')}
          style={{
            ...styles.link,
            ...((!currentCategory || currentCategory === 'all') && styles.linkActive),
          }}
        >
          All
        </button>
        
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            style={{
              ...styles.link,
              ...(currentCategory === category && styles.linkActive),
            }}
          >
            {category}
          </button>
        ))}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: 'sticky' as const,
    top: '2rem',
    height: 'fit-content',
  },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    fontWeight: 400,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: '#404040',
    marginBottom: '1.5rem',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  link: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 300,
    letterSpacing: '0.05em',
    color: '#1a1a1a',
    textAlign: 'left' as const,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    opacity: 0.6,
  },
  linkActive: {
    opacity: 1,
    fontWeight: 400,
  },
} as const;
