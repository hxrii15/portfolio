'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { BlogPost } from '@/lib/data'
import BlogCard from './BlogCard'
import { Button } from '../ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { db } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { Skeleton } from '../ui/skeleton'

type BlogSectionProps = {
  limit?: number;
  showViewAll?: boolean;
}

export default function BlogSection({ limit, showViewAll = false }: BlogSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')

  useEffect(() => {
    const blogRef = ref(db, 'blogs')
    const unsubscribe = onValue(blogRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const blogList = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          tags: data[key].tags || []
        }))
        // Sort by date (assuming YYYY or similar format, otherwise fallback)
        blogList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setPosts(blogList)
      } else {
        setPosts([])
      }
      setLoading(false)
    }, (error) => {
      console.error("Firebase blog fetch failed:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const allTags = useMemo(() => Array.from(new Set(posts.flatMap(p => p.tags || []))), [posts]);

  const filteredBlogs = useMemo(() => {
    const allFiltered = posts.filter(blog => {
      const searchMatch = (blog.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (blog.description || blog.content || '').toLowerCase().includes(searchQuery.toLowerCase())
      const tagMatch = selectedTag === 'all' || (blog.tags || []).includes(selectedTag)
      return searchMatch && tagMatch
    })
    if (limit) {
      return allFiltered.slice(0, limit);
    }
    return allFiltered
  }, [searchQuery, selectedTag, posts, limit])

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
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
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
            <p className="text-lg font-medium">No posts yet.</p>
            <p className="text-sm mt-2">Check back soon for new articles!</p>
          </div>
        )}
        {showViewAll && !loading && posts.length > 3 && (
          <div className="mt-12 text-center">
            <Button asChild variant="outline">
              <Link href="/blog">
                View All Posts <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
