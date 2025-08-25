import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomeSection from '@/components/home/HomeSection';
import AboutSection from '@/components/about/AboutSection';
import EducationSection from '@/components/education/EducationSection';
import ProjectsSection from '@/components/projects/ProjectsSection';
import BlogSection from '@/components/blog/BlogSection';
import Chatbot from '@/components/chatbot/Chatbot';
import PoemSection from '@/components/poem/PoemSection';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HomeSection />
        <AboutSection />
        <EducationSection />
        <ProjectsSection />
        <BlogSection />
        <PoemSection />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
