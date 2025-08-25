
import ProjectsSection from '@/components/projects/ProjectsSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects | Hariharan Portfolio',
  description: "Explore a collection of Hariharan's projects, showcasing skills in full-stack development, AI integration, and modern web technologies.",
  alternates: {
    canonical: '/projects',
  },
};


export default function ProjectsPage() {
  return (
    <main className="flex-1">
      <ProjectsSection />
    </main>
  );
}
