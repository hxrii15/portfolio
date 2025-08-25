
'use client'

import { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { BlogPost } from '@/lib/data'
import BlogCard from './BlogCard'
import { Button } from '../ui/button'
import { db } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { Skeleton } from '../ui/skeleton'

export default function BlogSection() {
  const [blogData, setBlogData] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  
  useEffect(() => {
    const cacheKey = 'blogDataCache';
    try {
      const cachedData = localStorage.getItem(cacheKey);
      const now = new Date().getTime();

      if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          if (now - timestamp < 24 * 60 * 60 * 1000) {
              setBlogData(data);
              setLoading(false);
          }
      }
    } catch (e) {
      console.error("Failed to read from localStorage", e);
    }

    const blogRef = ref(db, 'blog');
    const unsubscribe = onValue(blogRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const blogList: BlogPost[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setBlogData(blogList);
        try {
          const now = new Date().getTime();
          localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: blogList }));
        } catch (e) {
           console.error("Failed to write to localStorage", e);
        }
      } else {
        setBlogData([]);
      }
      setLoading(false);
    }, (error) => {
        console.error("Firebase read failed: " + error.message);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const allTags = useMemo(() => Array.from(new Set(blogData.flatMap(p => p.tags))), [blogData]);

  const filteredBlogs = useMemo(() => {
    return blogData.filter(blog => {
      const searchMatch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.description.toLowerCase().includes(searchQuery.toLowerCase())
      const tagMatch = selectedTag === 'all' || blog.tags.includes(selectedTag)
      return searchMatch && tagMatch
    })
  }, [searchQuery, selectedTag, blogData])

  return (
    <section id="blog" className="bg-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">From My Blog</h2>
          <p className="max-w-xl text-muted-foreground md:text-xl">Insights on technology, development, and more.</p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row mb-8">
          <Input
            type="text"
            placeholder="Search articles..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
           <div className="flex items-center gap-2">
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
            {[...Array(3)].map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No articles found. Try adjusting your search or filters.</p>
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
      <div className="p-6 pt-0 flex flex-col items-start gap-4">
        <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 inline-block rounded-full" />
            <Skeleton className="h-6 w-20 inline-block rounded-full" />
        </div>
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  )
}
