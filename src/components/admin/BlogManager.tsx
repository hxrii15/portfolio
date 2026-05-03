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
import { Edit, Trash2, PlusCircle, Loader2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function BlogManager() {
  const [blogData, setBlogData] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const { register, handleSubmit, reset, watch } = useForm<Omit<BlogPost, 'id'>>()
  const previewImage = watch('image')
  
  useEffect(() => {
    const blogRef = ref(db, 'blogs');
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
    setSelectedBlog(item);
    if (item) {
      reset(item);
    } else {
      reset({ 
        title: '', 
        description: '', 
        content: '', 
        image: 'https://placehold.co/600x400.png',
        tags: [],
        readTime: '5 min read'
      });
    }
    setIsFormOpen(true);
  }

  const handleDelete = (blog: BlogPost) => {
    setSelectedBlog(blog)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedBlog) return
    startTransition(async () => {
      try {
        await remove(ref(db, `blogs/${selectedBlog.id}`))
        toast({ title: 'Success', description: 'Blog post deleted.' })
        setIsDeleteDialogOpen(false)
        setSelectedBlog(null)
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete blog post.' })
      }
    });
  }
  
  const onSubmit = (data: any) => {
    // Convert tags string to array if it's a string
    if (typeof data.tags === 'string') {
        data.tags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    startTransition(async () => {
      try {
        const id = selectedBlog?.id || push(ref(db, 'blogs')).key
        await set(ref(db, `blogs/${id}`), data)
        toast({ title: 'Success', description: 'Blog post saved.' })
        setIsFormOpen(false)
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save blog post.' })
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Blog Post
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Read Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : blogData.length > 0 ? (
              blogData.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell>
                  <img src={blog.image} alt={blog.title} className="h-10 w-16 object-cover rounded border" />
                </TableCell>
                <TableCell className="font-medium">{blog.title}</TableCell>
                <TableCell>{blog.readTime}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenForm(blog)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(blog)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBlog ? 'Edit' : 'Add'} Blog Post</DialogTitle>
          </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" {...register('title', { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="readTime">Read Time</Label>
                    <Input id="readTime" placeholder="e.g. 5 min read" {...register('readTime', { required: true })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea id="description" {...register('description', { required: true })} rows={2} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" placeholder="React, Next.js, Web Dev" {...register('tags')} />
                </div>

                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <div className="flex items-start gap-4">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="h-20 w-32 object-cover rounded border" />
                    ) : (
                      <div className="h-20 w-32 bg-muted flex items-center justify-center rounded border border-dashed">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="relative">
                        <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="image" className="pl-8" {...register('image', { required: true })} placeholder="https://..." />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Reusing existing image rendering logic.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content (Markdown supported)</Label>
                  <Textarea id="content" {...register('content', { required: true })} className="min-h-[200px]" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} disabled={isPending}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                   {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Save Blog Post
                </Button>
              </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the blog post "{selectedBlog?.title}".
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
