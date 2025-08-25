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
import type { BlogPost } from '@/lib/data'
import { Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function BlogManager() {
  const [blogData, setBlogData] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const { register, handleSubmit, reset } = useForm<Omit<BlogPost, 'id'>>()
  
  useEffect(() => {
    const blogRef = ref(db, 'blog');
    const unsubscribe = onValue(blogRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const blogList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setBlogData(blogList);
      } else {
        setBlogData([])
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenForm = (item: BlogPost | null = null) => {
    setSelectedPost(item);
    if (item) {
      reset({ ...item, tags: item.tags.join(', ') });
    } else {
      reset({ title: '', description: '', content: '', image: 'https://placehold.co/600x400.png', readTime: '5 min read', tags: '' });
    }
    setIsFormOpen(true);
  }

  const handleDelete = (post: BlogPost) => {
    setSelectedPost(post)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedPost) return
    startTransition(async () => {
      try {
        await remove(ref(db, `blog/${selectedPost.id}`))
        toast({ title: 'Success', description: 'Blog post deleted.' })
        setIsDeleteDialogOpen(false)
        setSelectedPost(null)
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete post.' })
      }
    });
  }
  
  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        const id = selectedPost?.id || push(ref(db, 'blog')).key
        const postData = {
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : data.tags.split(',').map((t: string) => t.trim())
        }
        await set(ref(db, `blog/${id}`), postData)
        toast({ title: 'Success', description: 'Blog post saved.' })
        setIsFormOpen(false)
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save post.' })
      }
    });
  }

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
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : blogData.length > 0 ? (
              blogData.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="max-w-xs truncate">{post.description}</TableCell>
                <TableCell>{post.tags.join(', ')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenForm(post)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(post)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center">No blog posts found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedPost ? 'Edit' : 'Add'} Post</DialogTitle>
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
                  <Label htmlFor="content" className="text-right">Content (HTML)</Label>
                  <Textarea id="content" {...register('content')} className="col-span-3" rows={5} />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">Image URL</Label>
                  <Input id="image" {...register('image')} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">Tags</Label>
                  <Input id="tags" {...register('tags')} placeholder="Comma-separated tags" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="readTime" className="text-right">Read Time</Label>
                  <Input id="readTime" {...register('readTime')} className="col-span-3" />
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
              This action cannot be undone. This will permanently delete the post "{selectedPost?.title}".
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
