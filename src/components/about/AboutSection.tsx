import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Code, Database, Bot, Cloud, Monitor, BrainCircuit, BarChart, Settings } from 'lucide-react'
import Image from 'next/image'

const skills = [
  { icon: <Code className="h-8 w-8 text-primary" />, name: 'Frontend', description: 'React, Next.js, Vue' },
  { icon: <Database className="h-8 w-8 text-primary" />, name: 'Backend', description: 'Node.js, Python, Java' },
  { icon: <Bot className="h-8 w-8 text-primary" />, name: 'AI/ML', description: 'TensorFlow, PyTorch' },
  { icon: <Cloud className="h-8 w-8 text-primary" />, name: 'Cloud', description: 'AWS, GCP, Firebase' },
  { icon: <Monitor className="h-8 w-8 text-primary" />, name: 'DevOps', description: 'Docker, Kubernetes' },
  { icon: <BrainCircuit className="h-8 w-8 text-primary" />, name: 'GenAI', description: 'LangChain, Gemini' },
  { icon: <BarChart className="h-8 w-8 text-primary" />, name: 'Databases', description: 'SQL, NoSQL, GraphQL' },
  { icon: <Settings className="h-8 w-8 text-primary" />, name: 'Tooling', description: 'Git, Webpack, Vite' },
]

export default function AboutSection() {
  return (
    <section id="about" className="bg-background">
      <div className="container mx-auto flex flex-col items-center gap-12 px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About Me</h2>
          <p className="max-w-3xl text-muted-foreground md:text-xl">
            A lifelong learner with a passion for turning complex problems into elegant, user-friendly software solutions.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2 flex justify-center">
            <Image
              src="https://placehold.co/600x800.png"
              alt="About Me Image"
              width={600}
              height={800}
              className="rounded-lg object-cover shadow-xl"
              data-ai-hint="person coding"
            />
          </div>
          <div className="lg:col-span-3 space-y-6">
            <h3 className="font-headline text-2xl font-bold">My Journey & Philosophy</h3>
            <p className="text-muted-foreground">
              From my first "Hello, World!" to architecting scalable cloud applications, my journey in technology has been driven by curiosity and a desire to create. I believe in the power of clean code, thoughtful design, and continuous improvement. I thrive in collaborative environments where I can both learn from and mentor my peers.
            </p>
            <p className="text-muted-foreground">
              Beyond the code, I'm an avid reader, a hobbyist photographer, and I enjoy exploring the intersection of art and artificial intelligence. I'm always on the lookout for new challenges and opportunities to grow.
            </p>
            <h3 className="font-headline text-2xl font-bold pt-4">My Skillset</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {skills.map((skill) => (
                <Card key={skill.name} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader className="items-center">
                    {skill.icon}
                    <CardTitle className="text-lg">{skill.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{skill.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
