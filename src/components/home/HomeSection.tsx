
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import TypingAnimation from './TypingAnimation'
import { db } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import type { HomeData } from '@/lib/data'
import { Skeleton } from '../ui/skeleton'

export default function HomeSection() {
  const [homeData, setHomeData] = useState<HomeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cacheKey = 'homeDataCache';
    try {
      const cachedData = localStorage.getItem(cacheKey);
      const now = new Date().getTime();

      if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        // If cache is less than 24 hours old, use it initially
        if (now - timestamp < 24 * 60 * 60 * 1000) {
          setHomeData(data);
          setLoading(false);
        }
      }
    } catch (e) {
      console.error("Failed to read from localStorage", e);
    }

    const homeRef = ref(db, 'home')
    const unsubscribe = onValue(homeRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setHomeData(data)
        try {
          const now = new Date().getTime();
          localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data }));
        } catch (e) {
          console.error("Failed to write to localStorage", e);
        }
      }
      setLoading(false)
    }, (error) => {
      console.error("Firebase read failed: " + error.message);
      setLoading(false);
    });

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <section id="home" className="bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
            <div className="flex justify-center">
              <Skeleton className="h-[500px] w-[500px] rounded-full" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!homeData) {
    return <section id="home" className="bg-background py-20 text-center">No content available.</section>
  }

  return (
    <section id="home" className="bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Hi, I'm {homeData.name}
            </h1>
            <div className="text-lg text-primary md:text-xl font-semibold h-8">
              <TypingAnimation roles={homeData.roles} />
            </div>
            <p className="max-w-prose text-muted-foreground md:text-lg">
              {homeData.description}
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
              src={homeData.profileImage || 'https://placehold.co/500x500.png'}
              alt={`${homeData.name}'s Profile Picture`}
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
