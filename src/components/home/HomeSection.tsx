import Image from 'next/image'
import { Button } from '@/components/ui/button'
import TypingAnimation from './TypingAnimation'

export default function HomeSection() {
  return (
    <section id="home" className="bg-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Hi, I'm Hariharan
            </h1>
            <div className="text-lg text-primary md:text-xl font-semibold h-8">
              <TypingAnimation />
            </div>
            <p className="max-w-prose text-muted-foreground md:text-lg">
              A passionate developer and AI enthusiast dedicated to building innovative solutions that push the boundaries of technology. Welcome to my digital space.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <a href="#projects">View My Work</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#about">More About Me</a>
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <Image
              src="https://placehold.co/500x500.png"
              alt="Hariharan's Profile Picture"
              width={500}
              height={500}
              className="rounded-full object-cover aspect-square shadow-lg border-4 border-card"
              data-ai-hint="professional headshot"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
