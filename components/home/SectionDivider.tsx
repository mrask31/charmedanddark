interface SectionDividerProps {
  text?: string;
  spacing?: 'normal' | 'large';
}

export default function SectionDivider({ text, spacing = 'normal' }: SectionDividerProps) {
  return (
    <div className={`section-divider ${spacing === 'large' ? 'section-divider-large' : ''}`}>
      {text && <p className="section-divider-text">{text}</p>}
    </div>
  );
}
