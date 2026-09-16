import Image from 'next/image';

/** Original product photographs; no reconstructed product artwork. */
export default function BundlePreview({ images, components, priority = false }) {
  return <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1 bg-[#100b12]" aria-label="The three products included in this bundle">
    {components.slice(0, 3).map((item, index) => <div key={item.productId} className={`relative min-h-0 overflow-hidden ${index === 0 ? 'col-span-2' : ''}`}>
      {images[index] && <Image src={images[index]} alt={item.label} fill priority={priority && index === 0} sizes="(max-width: 768px) 50vw, 30vw" className="object-cover" />}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent px-3 pb-3 pt-8 text-center text-[11px] leading-snug text-[#f7f1f3]">{item.label}</div>
    </div>)}
  </div>;
}
