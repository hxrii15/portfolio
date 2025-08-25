import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Poem } from '@/lib/data'

type PoemCardProps = {
  poem: Poem
}

export default function PoemCard({ poem }: PoemCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="p-0">
            <div className="aspect-video relative">
              <Image
                src={poem.image}
                alt={poem.title}
                fill
                className="object-cover"
                data-ai-hint="abstract art"
              />
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-grow">
            <CardTitle className="font-headline mb-2">{poem.title}</CardTitle>
            <CardDescription>by {poem.author}</CardDescription>
          </CardContent>
           <CardFooter className="p-6 pt-0">
             <p className="text-sm text-primary hover:underline">Read poem</p>
           </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{poem.title}</DialogTitle>
          <CardDescription>by {poem.author}</CardDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6">
            <p className="whitespace-pre-wrap py-4 text-muted-foreground">
                {poem.poem}
            </p>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
