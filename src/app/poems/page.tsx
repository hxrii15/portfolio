
import PoemSection from '@/components/poem/PoemSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Poems | Hariharan Portfolio',
  description: 'A collection of original poems by Hariharan, exploring themes of technology, life, and introspection.',
  alternates: {
    canonical: '/poems',
  },
};

export default function PoemsPage() {
  return (
    <main className="flex-1">
      <PoemSection />
    </main>
  );
}
