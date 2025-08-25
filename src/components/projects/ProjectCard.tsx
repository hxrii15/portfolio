import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Eye, Code2 } from 'lucide-react'
import type { Project } from '@/lib/data'

type ProjectCardProps = {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="p-0">
            <div className="aspect-video relative">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
                data-ai-hint="project screenshot"
              />
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-grow">
            <CardTitle className="font-headline mb-2">{project.title}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex-col items-start gap-4">
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{project.title}</DialogTitle>
          <div className="flex flex-wrap gap-2 pt-2">
            {project.tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          <div className="aspect-video relative rounded-md overflow-hidden mb-4">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              data-ai-hint="project screenshot"
            />
          </div>
          <DialogDescription>
            {project.details}
          </DialogDescription>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              <Eye className="mr-2 h-4 w-4" />
              Live Demo
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              <Code2 className="mr-2 h-4 w-4" />
              Source Code
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
