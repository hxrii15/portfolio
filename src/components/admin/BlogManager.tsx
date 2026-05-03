'use client'

import { useState, useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db } from '@/lib/firebase'
import { ref, onValue, set, remove, push } from 'firebase/database'
import type { BlogPost } from '@/lib/data'
import { Loader2, Trash2, Edit2, Link as LinkIcon, Image as ImageIcon, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

// Blog Form Component
const BlogForm = ({ onSave, initialData, onCancel }: { 
    onSave: (entry: Omit<BlogPost, 'id'>) => Promise<void>, 
    initialData?: BlogPost | null,
    onCancel?: () => void
}) => {
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<Omit<BlogPost, 'id'>>({
      defaultValues: initialData || {
          title: '',
          content: '',
          image: '',
          date: '',
          description: '', // We'll use content for description too or keep it simple
          tags: [],
          readTime: ''
      }
  })

  const previewUrl = watch('image')

  useEffect(() => {
    if (initialData) {
        reset(initialData)
    } else {
        reset({
            title: '',
            content: '',
            image: '',
            date: '',
            description: '',
            tags: [],
            readTime: ''
        })
    }
  }, [initialData, reset])

  const handleSave = async (data: Omit<BlogPost, 'id'>) => {
    // If description is empty, use a snippet of content
    if (!data.description) {
        data.description = data.content.substring(0, 150) + '...';
    }
    // Ensure tags is an array
    if (typeof data.tags === 'string') {
        data.tags = (data.tags as string).split(',').map(t => t.trim()).filter(Boolean);
    }
    
    await onSave(data)
    if (!initialData) reset()
  }

  return (
    <Card className={initialData ? "border-primary/50" : "bg-muted/50"}>
        <CardHeader>
            <CardTitle>{initialData ? 'Edit Blog Post' : 'Add New Blog Post'}</CardTitle>
            <CardDescription>
                {initialData ? 'Update your blog post details.' : 'Fill out the form to add a new blog post.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
             <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input {...register('title', { required: true })} placeholder="Post Title" />
                    </div>
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" {...register('date', { required: true })} placeholder="e.g. June 2025" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Image URL</Label>
                    <div className="flex items-start gap-4">
                        <div className="relative group flex-shrink-0">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="h-20 w-32 object-cover rounded-md border" />
                            ) : (
                                <div className="h-20 w-32 bg-muted flex items-center justify-center rounded-md border border-dashed">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="relative">
                                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    className="pl-9"
                                    placeholder="https://example.com/image.jpg" 
                                    {...register('image', { required: true })} 
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Paste a direct image link. A preview will appear on the left.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Content / Description</Label>
                    <Textarea 
                        {...register('content', { required: true })} 
                        placeholder="Write your blog post content here..." 
                        rows={6}
                    />
                </div>

                <div className="flex justify-end gap-2">
                     {onCancel && (
                         <Button type="button" variant="outline" onClick={onCancel}>
                             Cancel
                         </Button>
                     )}
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Update Post' : 'Add Post'}
                    </Button>
                </div>
             </form>
        </CardContent>
    </Card>
  )
}

export function BlogManager() {
  const [blogData, setBlogData] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)
  const { toast } = useToast()
  
  useEffect(() => {
    const blogRef = ref(db, 'blogs');

    const unsubscribe = onValue(blogRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const blogList = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  const handleAddBlog = async (newEntry: Omit<BlogPost, 'id'>) => {
    try {
        const newEntryRef = push(ref(db, 'blogs'));
        await set(newEntryRef, newEntry);
        toast({ title: 'Success', description: 'New blog post added.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to add blog post.' });
    }
  }
  
  const handleUpdateBlog = async (updatedEntry: Omit<BlogPost, 'id'>) => {
      if (!editingBlog) return;
      try {
          await set(ref(db, `blogs/${editingBlog.id}`), updatedEntry);
          toast({ title: 'Success', description: 'Blog post updated.' });
          setEditingBlog(null);
      } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to update blog post.' });
      }
  }
  
  const handleRemoveBlog = async (id: string) => {
      if (!id) return;
      if (confirm('Are you sure you want to delete this blog post?')) {
          try {
            await remove(ref(db, `blogs/${id}`));
            toast({ title: 'Success', description: 'Blog post deleted.' });
          } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete blog post.' });
          }
      }
  }

  return (
    <div className="space-y-12">
        <div className="space-y-6">
            {editingBlog ? (
                <BlogForm 
                    onSave={handleUpdateBlog} 
                    initialData={editingBlog} 
                    onCancel={() => setEditingBlog(null)} 
                />
            ) : (
                <BlogForm onSave={handleAddBlog} />
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Existing Blog Posts</CardTitle>
                    <CardDescription>Manage your published articles.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-48 w-full" />
                    ) : blogData.length > 0 ? (
                        <div className="border rounded-md">
                            {blogData.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className="h-12 w-20 object-cover rounded border flex-shrink-0" />
                                        ) : (
                                            <div className="h-12 w-20 bg-muted flex items-center justify-center rounded border flex-shrink-0">
                                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-bold truncate">{item.title}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> {item.date}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate mt-1">{item.description || item.content}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 ml-4">
                                        <Button variant="ghost" size="icon" onClick={() => setEditingBlog(item)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveBlog(item.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No blog posts found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
