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
import { Edit, Trash2, PlusCircle, Loader2, Calendar, Clock, Tag, Image as ImageIcon } from 'lucide-react'
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
        })).sort((a, b) => {
             // Handle potential invalid dates
             const dateA = new Date(a.date).getTime();
             const dateB = new Date(b.date).getTime();
             return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        });
        setBlogData(blogList);
      } else {
        setBlogData([])
      }
      setLoading(false);
    }, (error) => {
        console.error("Firebase blogs read failed:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenForm = (item: BlogPost | null = null) => {
    setSelectedBlog(item);
    if (item) {
      reset({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags
      });
    } else {
      reset({ 
        title: '', 
        description: '', 
        content: '', 
        image: '', 
        date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), 
        readTime: '5 min read',
        tags: ''
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
    startTransition(async () => {
      try {
        const id = selectedBlog?.id || push(ref(db, 'blogs')).key
        const blogEntry = {
          ...data,
          tags: typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : (Array.isArray(data.tags) ? data.tags : [])
        }
        await set(ref(db, `blogs/${id}`), blogEntry)
        toast({ title: 'Success', description: 'Blog post saved.' })
        setIsFormOpen(false)
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save blog post.' })
      }
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Post
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : blogData.length > 0 ? (
              blogData.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        {blog.image && <img src={blog.image} alt="" className="w-10 h-10 object-cover rounded border" />}
                        <span className="truncate max-w-[200px] font-bold">{blog.title}</span>
                    </div>
                </TableCell>
                <TableCell className="text-sm">{blog.date}</TableCell>
                <TableCell>
                    <div className="flex flex-wrap gap-1">
                        {Array.isArray(blog.tags) && blog.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full border border-primary/10">{tag}</span>
                        ))}
                        {Array.isArray(blog.tags) && blog.tags.length > 2 && <span className="text-[10px] text-muted-foreground">+{blog.tags.length - 2}</span>}
                    </div>
                </TableCell>
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
              <TableRow><TableCell colSpan={4} className="text-center py-8">No blog posts found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBlog ? 'Edit' : 'Add'} Blog Post</DialogTitle>
            <DialogDescription>
                Fill in the details for your blog post. Tags should be comma-separated.
            </DialogDescription>
          </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input id="title" {...register('title', { required: true })} className="col-span-3" />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Date</Label>
                  <div className="col-span-3 relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="date" {...register('date', { required: true })} className="pl-9" placeholder="e.g. June 2025" />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="readTime" className="text-right">Read Time</Label>
                  <div className="col-span-3 relative">
                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="readTime" {...register('readTime')} className="pl-9" placeholder="e.g. 5 min read" />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">Tags</Label>
                  <div className="col-span-3 relative">
                    <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="tags" {...register('tags')} className="pl-9" placeholder="React, Next.js, TailWind (comma separated)" />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">Image URL</Label>
                  <div className="col-span-3 flex gap-4 items-center">
                    <div className="relative flex-1">
                        <ImageIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="image" {...register('image')} className="pl-9" placeholder="https://..." />
                    </div>
                    {previewImage && (
                        <img src={previewImage} alt="Preview" className="w-12 h-12 object-cover rounded border" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right mt-2">Description</Label>
                  <Textarea id="description" {...register('description', { required: true })} className="col-span-3" rows={2} placeholder="Short summary for the card..." />
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right mt-2">Content</Label>
                  <Textarea id="content" {...register('content', { required: true })} className="col-span-3" rows={8} placeholder="Main blog content..." />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} disabled={isPending}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                   {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   {selectedBlog ? 'Update Post' : 'Save Post'}
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
