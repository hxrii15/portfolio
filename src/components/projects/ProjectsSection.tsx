'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { projectsData } from '@/lib/data'
import ProjectCard from './ProjectCard'

const allTags = Array.from(new Set(projectsData.flatMap(p => p.tags)))

export default function ProjectsSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')

  const filteredProjects = useMemo(() => {
    return projectsData.filter(project => {
      const searchMatch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase())
      const tagMatch = selectedTag === 'all' || project.tags.includes(selectedTag)
      return searchMatch && tagMatch
    })
  }, [searchQuery, selectedTag])

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
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Select onValueChange={setSelectedTag} defaultValue="all">
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

        {filteredProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No projects found. Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </section>
  )
}
