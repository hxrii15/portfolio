
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock } from 'lucide-react'
import type { BlogPost } from '@/lib/data'
import ReactMarkdown from 'react-markdown'

type BlogCardProps = {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="p-0">
            <div className="aspect-video relative">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                data-ai-hint="technology blog"
              />
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-grow">
            <CardTitle className="font-headline mb-2">{post.title}</CardTitle>
            <CardDescription>{post.description}</CardDescription>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex flex-col items-start gap-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[725px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{post.title}</DialogTitle>
           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-muted-foreground pt-2">
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6">
            <div className="py-4 prose dark:prose-invert">
                <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
