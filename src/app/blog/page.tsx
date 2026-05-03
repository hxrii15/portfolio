import BlogSection from '@/components/blog/BlogSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Hariharan Portfolio',
  description: 'Read articles and insights on web development, AI, programming, and technology from Hariharan.',
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogPage() {
  return (
    <main className="flex-1">
      <BlogSection />
    </main>
  );
}
