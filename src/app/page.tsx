
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomeSection from '@/components/home/HomeSection';
import AboutSection from '@/components/about/AboutSection';
import EducationSection from '@/components/education/EducationSection';
import ProjectsSection from '@/components/projects/ProjectsSection';
import BlogSection from '@/components/blog/BlogSection';
import PoemSection from '@/components/poem/PoemSection';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { BlogPost } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | Hariharan Portfolio',
  description: "Welcome to the personal portfolio of Hariharan. Explore my projects, skills, and journey as a full-stack developer and AI enthusiast.",
  alternates: {
    canonical: '/',
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


export default async function Home() {
  const blogPosts = await getBlogPosts();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HomeSection />
        <AboutSection />
        <EducationSection />
        <ProjectsSection limit={3} showViewAll />
        <BlogSection posts={blogPosts} limit={3} showViewAll />
        <PoemSection limit={3} showViewAll />
      </main>
      <Footer />
    </div>
  );
}
