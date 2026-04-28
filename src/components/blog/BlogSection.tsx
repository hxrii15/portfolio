
'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { BlogPost } from '@/lib/data'
import BlogCard from './BlogCard'
import { Button } from '../ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type BlogSectionProps = {
  posts: BlogPost[];
  limit?: number;
  showViewAll?: boolean;
}

export default function BlogSection({ posts, limit, showViewAll = false }: BlogSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')

  const allTags = useMemo(() => Array.from(new Set(posts.flatMap(p => p.tags))), [posts]);

  const filteredBlogs = useMemo(() => {
    const allFiltered = posts.filter(blog => {
      const searchMatch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.description.toLowerCase().includes(searchQuery.toLowerCase())
      const tagMatch = selectedTag === 'all' || blog.tags.includes(selectedTag)
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
        
        {filteredBlogs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No articles found. Please check back later.</p>
            <p className="text-sm mt-2">To add a blog post, create a new `.md` file in the `src/blog` directory.</p>
          </div>
        )}
        {showViewAll && (
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
