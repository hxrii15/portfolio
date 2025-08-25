'use client'

import { useState, useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
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
import type { Poem } from '@/lib/data'
import { Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function PoemManager() {
  const [poemData, setPoemData] = useState<Poem[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const { register, handleSubmit, reset } = useForm<Omit<Poem, 'id'>>()
  
  useEffect(() => {
    const poemRef = ref(db, 'poems');
    const unsubscribe = onValue(poemRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const poemList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setPoemData(poemList);
      } else {
        setPoemData([])
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenForm = (item: Poem | null = null) => {
    setSelectedPoem(item);
    if (item) {
      reset(item);
    } else {
      reset({ title: '', author: '', poem: '', image: 'https://placehold.co/600x400.png' });
    }
    setIsFormOpen(true);
  }

  const handleDelete = (poem: Poem) => {
    setSelectedPoem(poem)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedPoem) return
    startTransition(async () => {
      try {
        await remove(ref(db, `poems/${selectedPoem.id}`))
        toast({ title: 'Success', description: 'Poem deleted.' })
        setIsDeleteDialogOpen(false)
        setSelectedPoem(null)
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete poem.' })
      }
    });
  }
  
  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        const id = selectedPoem?.id || push(ref(db, 'poems')).key
        await set(ref(db, `poems/${id}`), data)
        toast({ title: 'Success', description: 'Poem saved.' })
        setIsFormOpen(false)
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save poem.' })
      }
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Poem
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
            ) : poemData.length > 0 ? (
              poemData.map((poem) => (
              <TableRow key={poem.id}>
                <TableCell className="font-medium">{poem.title}</TableCell>
                <TableCell>{poem.author}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenForm(poem)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(poem)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={3} className="text-center">No poems found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedPoem ? 'Edit' : 'Add'} Poem</DialogTitle>
          </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input id="title" {...register('title', { required: true })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="author" className="text-right">Author</Label>
                  <Input id="author" {...register('author', { required: true })} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="poem" className="text-right">Poem</Label>
                  <Textarea id="poem" {...register('poem', { required: true })} className="col-span-3" rows={10} />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">Image URL</Label>
                  <Input id="image" {...register('image')} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} disabled={isPending}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                   {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Save Poem
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
              This action cannot be undone. This will permanently delete the poem "{selectedPoem?.title}".
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
