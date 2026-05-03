
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomeSection from '@/components/home/HomeSection';
import AboutSection from '@/components/about/AboutSection';
import EducationSection from '@/components/education/EducationSection';
import ProjectsSection from '@/components/projects/ProjectsSection';
import BlogSection from '@/components/blog/BlogSection';
import PoemSection from '@/components/poem/PoemSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | Hariharan Portfolio',
  description: "Welcome to the personal portfolio of Hariharan. Explore my projects, skills, and journey as a full-stack developer and AI enthusiast.",
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HomeSection />
        <AboutSection />
        <EducationSection />
        <ProjectsSection limit={3} showViewAll />
        <BlogSection limit={3} showViewAll />
        <PoemSection limit={3} showViewAll />
      </main>
      <Footer />
    </div>
  );
}
