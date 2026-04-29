
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
    const cacheKey = 'educationDataCache';
    try {
      const cachedData = localStorage.getItem(cacheKey);
      const now = new Date().getTime();

      if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          if (now - timestamp < 24 * 60 * 60 * 1000) {
              setEducationData(data);
              setLoading(false);
          }
      }
    } catch (e) {
        console.error("Failed to read from localStorage", e);
    }

    const educationRef = ref(db, 'education')
    const unsubscribe = onValue(educationRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const getEndYear = (duration: string) => {
          const parts = duration.split('-');
          const lastPart = parts[parts.length - 1].trim().toLowerCase();
          if (lastPart === 'present' || lastPart === 'current') return 9999;
          const year = parseInt(lastPart.match(/\d{4}/)?.[0] || '0');
          return year;
        };

        const educationList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => getEndYear(b.duration) - getEndYear(a.duration));
        setEducationData(educationList)
        try {
            const now = new Date().getTime();
            localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: educationList }));
        } catch(e) {
            console.error("Failed to write to localStorage", e);
        }
      } else {
        setEducationData([])
      }
      setLoading(false)
    }, (error) => {
        console.error("Firebase read failed: " + error.message);
        setLoading(false);
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
             <div className="space-y-8 max-w-2xl mx-auto">
               <div className="hidden md:block absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-border"></div>
               {[...Array(2)].map((_, i) => (
                  <div key={i} className={`relative flex w-full items-center gap-4 md:justify-between ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="hidden md:block w-5/12"></div>
                    <div className="z-10 flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-muted ring-4 md:ring-8 ring-background">
                        <Skeleton className="h-5 w-5" />
                    </div>
                    <div className="w-full md:w-5/12">
                       <Card>
                          <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-5 w-2/3" />
                          </CardContent>
                       </Card>
                    </div>
                  </div>
               ))}
             </div>
           ) : (
            <>
              {educationData.length > 0 && <div className="hidden md:block absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-border"></div>}
              <div className="max-w-2xl mx-auto space-y-6 md:space-y-0">
                {educationData.map((item, index) => (
                  <div key={item.id} className={`relative mb-0 md:mb-8 flex w-full items-center gap-4 md:gap-0 md:justify-between ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="hidden md:block w-5/12"></div>
                    <div className="z-10 flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 md:ring-8 ring-background">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="w-full md:w-5/12">
                      <Card className="shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start gap-2">
                            <CardTitle className="font-headline text-lg md:text-xl font-bold">{item.degree}</CardTitle>
                            {item.current && <Badge className="shrink-0">Current</Badge>}
                          </div>
                          <p className="text-sm font-normal text-foreground/80">{item.institution}</p>
                          <p className="text-sm text-muted-foreground">{item.duration}</p>
                        </CardHeader>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
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
