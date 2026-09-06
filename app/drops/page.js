import { getMerchandisingProducts } from '@/lib/catalog-merchandising';
import DropsContent from '@/components/drops/DropsContent';

export const revalidate = 60;
export const metadata = {
  title: 'Drops & Collections',
  description: 'Explore seasonal gothic collections, bookish essentials, and the latest Charmed & Dark drops.',
  alternates: { canonical: 'https://www.charmedanddark.com/drops' },
};

export default async function DropsPage() {
  const [smuttyGoodGirl, summerween] = await Promise.all([
    getMerchandisingProducts('smutty-good-girl'),
    getMerchandisingProducts('summerween'),
  ]);
  return <DropsContent smuttyGoodGirl={smuttyGoodGirl} summerween={summerween} />;
}
