'use client'

import { useState, useEffect, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db } from '@/lib/firebase'
import { ref, onValue, set, remove, push } from 'firebase/database'
import type { Project } from '@/lib/data'
import { Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function ProjectsManager() {
  const [projectsData, setProjectsData] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const { register, handleSubmit, reset, control } = useForm<Omit<Project, 'id'>>()

  useEffect(() => {
    const projectsRef = ref(db, 'projects');
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const projectsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProjectsData(projectsList);
      } else {
        setProjectsData([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenForm = (item: Project | null = null) => {
    setSelectedProject(item);
    if (item) {
        reset({ ...item, tags: item.tags.join(', ') });
    } else {
        reset({ title: '', description: '', details: '', image: 'https://placehold.co/600x400.png', link: '#', tags: '' });
    }
    setIsFormOpen(true);
  }

  const handleDelete = (item: Project) => {
    setSelectedProject(item);
    setIsDeleteDialogOpen(true);
  }

  const confirmDelete = () => {
    if (!selectedProject) return;
    startTransition(async () => {
      try {
        await remove(ref(db, `projects/${selectedProject.id}`));
        toast({ title: 'Success', description: 'Project deleted.' });
        setIsDeleteDialogOpen(false);
        setSelectedProject(null);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete project.' });
      }
    });
  }
  
  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        const id = selectedProject?.id || push(ref(db, 'projects')).key;
        const projectData = {
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : data.tags.split(',').map((t: string) => t.trim())
        };
        await set(ref(db, `projects/${id}`), projectData);
        toast({ title: 'Success', description: 'Project saved.' });
        setIsFormOpen(false);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save project.' });
      }
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : projectsData.length > 0 ? (
              projectsData.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{project.description}</TableCell>
                  <TableCell>{project.tags.join(', ')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(project)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
             ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No projects found.</TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedProject ? 'Edit' : 'Add'} Project</DialogTitle>
          </DialogHeader>
           <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" {...register('title', { required: true })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" {...register('description', { required: true })} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="details" className="text-right">Details</Label>
                <Textarea id="details" {...register('details')} className="col-span-3" rows={5} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">Image URL</Label>
                <Input id="image" {...register('image')} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link" className="text-right">Live Link</Label>
                <Input id="link" {...register('link')} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">Tags</Label>
                <Input id="tags" {...register('tags')} placeholder="Comma-separated tags" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the project "{selectedProject?.title}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)} disabled={isPending}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
