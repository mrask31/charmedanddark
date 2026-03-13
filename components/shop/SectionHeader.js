export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="font-serif text-3xl italic text-white md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm text-zinc-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
