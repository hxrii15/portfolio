import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { educationData } from '@/lib/data'
import { GraduationCap } from 'lucide-react'

export default function EducationSection() {
  return (
    <section id="education" className="bg-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Education</h2>
          <p className="max-w-xl text-muted-foreground md:text-xl">My academic background and qualifications.</p>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-border"></div>
          {educationData.map((item, index) => (
            <div key={index} className="relative mb-8 flex w-full items-center justify-between md:odd:flex-row-reverse">
              <div className="hidden md:block w-5/12"></div>
              <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="w-full md:w-5/12">
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="font-headline text-xl">{item.institution}</CardTitle>
                      {item.current && <Badge>Current</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.duration}</p>
                  </CardHeader>
                  <CardContent>
                    <p>{item.degree}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
