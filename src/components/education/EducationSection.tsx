'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Education } from '@/lib/data'
import { db } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { GraduationCap } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'

export default function EducationSection() {
  const [educationData, setEducationData] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const educationRef = ref(db, 'education')
    const unsubscribe = onValue(educationRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const educationList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => (b.current ? 1 : -1)); // Keep current education on top
        setEducationData(educationList)
      } else {
        setEducationData([])
      }
      setLoading(false)
    });

    return () => unsubscribe();
  }, [])

  return (
    <section id="education" className="bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Education</h2>
          <p className="max-w-xl text-muted-foreground md:text-xl">My academic background and qualifications.</p>
        </div>
        <div className="relative">
           {loading ? (
             <div className="space-y-8">
               {[...Array(2)].map((_, i) => (
                  <div key={i} className="relative flex w-full items-center justify-between md:odd:flex-row-reverse">
                    <div className="hidden md:block w-5/12"></div>
                    <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted"></div>
                    <div className="w-full md:w-5/12">
                       <Card>
                          <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                          <CardContent><Skeleton className="h-4 w-1/2" /></CardContent>
                       </Card>
                    </div>
                  </div>
               ))}
             </div>
           ) : (
            <>
              {educationData.length > 0 && <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-border"></div>}
              {educationData.map((item) => (
                <div key={item.id} className="relative mb-8 flex w-full items-center justify-between md:odd:flex-row-reverse">
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
            </>
           )}
           {!loading && educationData.length === 0 && (
             <p className="text-center text-muted-foreground">No education information available at the moment.</p>
           )}
        </div>
      </div>
    </section>
  )
}
