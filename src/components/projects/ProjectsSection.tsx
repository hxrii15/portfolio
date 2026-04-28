
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Project } from '@/lib/data'
import ProjectCard from './ProjectCard'
import { db } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { Skeleton } from '../ui/skeleton'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type ProjectsSectionProps = {
  limit?: number;
  showViewAll?: boolean;
}

export default function ProjectsSection({ limit, showViewAll = false }: ProjectsSectionProps) {
  const [projectsData, setProjectsData] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')

  useEffect(() => {
    const cacheKey = 'projectsDataCache';
    try {
      const cachedData = localStorage.getItem(cacheKey);
      const now = new Date().getTime();

      if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          if (now - timestamp < 24 * 60 * 60 * 1000) {
              setProjectsData(data);
              setLoading(false);
          }
      }
    } catch (e) {
      console.error("Failed to read from localStorage", e);
    }

    const projectsRef = ref(db, 'projects');
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const projectsList: Project[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProjectsData(projectsList);
        try {
          const now = new Date().getTime();
          localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: projectsList }));
        } catch (e) {
           console.error("Failed to write to localStorage", e);
        }
      } else {
        setProjectsData([]);
      }
      setLoading(false);
    }, (error) => {
        console.error("Firebase read failed: " + error.message);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const allTags = useMemo(() => Array.from(new Set(projectsData.flatMap(p => p.tags))), [projectsData]);

  const filteredProjects = useMemo(() => {
    const allFiltered = projectsData.filter(project => {
      const searchMatch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase())
      const tagMatch = selectedTag === 'all' || project.tags.includes(selectedTag)
      return searchMatch && tagMatch
    })
    if (limit) {
      return allFiltered.slice(0, limit);
    }
    return allFiltered
  }, [searchQuery, selectedTag, projectsData, limit])

  return (
    <section id="projects" className="bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">My Projects</h2>
          <p className="max-w-xl text-muted-foreground md:text-xl">A selection of projects that I'm proud of.</p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row mb-8">
          <Input
            type="text"
            placeholder="Search projects..."
            className="w-full md:max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select onValueChange={setSelectedTag} defaultValue="all" value={selectedTag}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchQuery || selectedTag !== 'all') && (
              <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedTag('all'); }}>Clear</Button>
            )}
          </div>
        </div>

        {loading ? (
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(limit || 3)].map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No projects found. Try adjusting your search or filters.</p>
          </div>
        )}
        {showViewAll && (
          <div className="mt-12 text-center">
            <Button asChild variant="outline">
              <Link href="/projects">
                View All Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 rounded-xl border bg-card text-card-foreground shadow-sm">
      <Skeleton className="h-[225px] w-full rounded-t-xl" />
      <div className="space-y-2 p-6 pt-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="p-6 pt-0 space-x-2">
        <Skeleton className="h-6 w-16 inline-block rounded-full" />
        <Skeleton className="h-6 w-20 inline-block rounded-full" />
      </div>
    </div>
  )
}
