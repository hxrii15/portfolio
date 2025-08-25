
'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Poem } from '@/lib/data'
import PoemCard from './PoemCard'
import { db } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type PoemSectionProps = {
  limit?: number;
  showViewAll?: boolean;
}

export default function PoemSection({ limit, showViewAll = false }: PoemSectionProps) {
  const [poemData, setPoemData] = useState<Poem[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const cacheKey = 'poemDataCache';
    try {
      const cachedData = localStorage.getItem(cacheKey);
      const now = new Date().getTime();

      if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          if (now - timestamp < 24 * 60 * 60 * 1000) {
              setPoemData(data);
              setLoading(false);
          }
      }
    } catch (e) {
      console.error("Failed to read from localStorage", e);
    }

    const poemRef = ref(db, 'poems');
    const unsubscribe = onValue(poemRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const poemList: Poem[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setPoemData(poemList);
        try {
          const now = new Date().getTime();
          localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: poemList }));
        } catch (e) {
           console.error("Failed to write to localStorage", e);
        }
      } else {
        setPoemData([]);
      }
      setLoading(false);
    }, (error) => {
        console.error("Firebase read failed: " + error.message);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const displayedPoems = useMemo(() => {
    if (limit) {
      return poemData.slice(0, limit);
    }
    return poemData;
  }, [poemData, limit]);

  return (
    <section id="poem" className="bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">My Poems</h2>
          <p className="max-w-xl text-muted-foreground md:text-xl">A collection of my thoughts and feelings in verse.</p>
        </div>
        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(limit || 3)].map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : displayedPoems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedPoems.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No poems available at the moment. Please check back later.</p>
          </div>
        )}
         {showViewAll && (
          <div className="mt-12 text-center">
            <Button asChild variant="outline">
              <Link href="/poems">
                View All Poems <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 rounded-xl border bg-card text-card-foreground shadow-sm">
      <Skeleton className="h-[225px] w-full rounded-t-xl" />
      <div className="space-y-2 p-6 pt-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="p-6 pt-0">
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  )
}
