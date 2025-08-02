'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { blogData } from '@/lib/data'
import BlogCard from './BlogCard'
import { Button } from '../ui/button'

const allTags = Array.from(new Set(blogData.flatMap(p => p.tags)))

export default function BlogSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')

  const filteredBlogs = useMemo(() => {
    return blogData.filter(blog => {
      const searchMatch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.description.toLowerCase().includes(searchQuery.toLowerCase())
      const tagMatch = selectedTag === 'all' || blog.tags.includes(selectedTag)
      return searchMatch && tagMatch
    })
  }, [searchQuery, selectedTag])

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
            <Select onValueChange={setSelectedTag} defaultValue="all">
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
            {filteredBlogs.map((post, index) => (
              <BlogCard key={index} post={post} />
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
