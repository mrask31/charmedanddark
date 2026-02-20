/**
 * Product Description Component
 * Displays the "Restrained" three-line description format
 */

interface ProductDescriptionProps {
  description: string;
  lines?: string[];
}

export default function ProductDescription({ description, lines }: ProductDescriptionProps) {
  // If we have structured lines, use them
  if (lines && lines.length > 0) {
    return (
      <div style={styles.container}>
        {lines.map((line, index) => (
          <p key={index} style={styles.line}>
            {line}
          </p>
        ))}
      </div>
    );
  }

  // Otherwise, split description by newlines
  const descriptionLines = description.split('\n').filter(Boolean);
  
  return (
    <div style={styles.container}>
      {descriptionLines.map((line, index) => (
        <p key={index} style={styles.line}>
          {line}
        </p>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  line: {
    margin: 0,
    fontSize: '0.9375rem',
    lineHeight: '1.6',
    color: '#404040',
    fontFamily: "'Inter', sans-serif",
  },
} as const;
