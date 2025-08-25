
import BlogSection from '@/components/blog/BlogSection';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { BlogPost } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Hariharan Portfolio',
  description: 'Read articles and insights on web development, AI, programming, and technology from Hariharan.',
  alternates: {
    canonical: '/blog',
  },
};

async function getBlogPosts(): Promise<BlogPost[]> {
    try {
        const postsDirectory = path.join(process.cwd(), 'src/blog');
        const filenames = fs.readdirSync(postsDirectory);

        const blogs = filenames
            .filter(filename => filename.endsWith('.md'))
            .map((filename) => {
                const filePath = path.join(postsDirectory, filename);
                const fileContents = fs.readFileSync(filePath, 'utf8');
                const { data, content } = matter(fileContents);

                return {
                    id: data.id || filename.replace(/\.md$/, ''),
                    title: data.title,
                    description: data.description,
                    image: data.image,
                    tags: data.tags,
                    readTime: data.readTime,
                    content: content,
                };
            });
        return blogs;
    } catch (error) {
        console.error('Error reading blog posts:', error);
        return [];
    }
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  return (
    <main className="flex-1">
      <BlogSection posts={blogPosts} />
    </main>
  );
}
