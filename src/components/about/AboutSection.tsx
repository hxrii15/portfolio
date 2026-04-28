
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import type { AboutData, Skill } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  if (!LucideIcon) {
    return <LucideIcons.Code className={className} />; // Default icon
  }
  return <LucideIcon className={className} />;
};

export default function AboutSection() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = 'aboutDataCache';
    try {
        const cachedData = localStorage.getItem(cacheKey);
        const now = new Date().getTime();

        if (cachedData) {
            const { timestamp, data } = JSON.parse(cachedData);
            if (now - timestamp < 24 * 60 * 60 * 1000) {
                setAboutData(data);
                setLoading(false);
            }
        }
    } catch (e) {
      console.error("Failed to read from localStorage", e);
    }

    const aboutRef = ref(db, 'about');
    const unsubscribe = onValue(aboutRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAboutData(data);
        try {
            const now = new Date().getTime();
            localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data }));
        } catch (e) {
            console.error("Failed to write to localStorage", e);
        }
      }
      setLoading(false);
    }, (error) => {
        console.error("Firebase read failed: " + error.message);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <section id="about" className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2 flex justify-center">
              <Skeleton className="w-[300px] h-[400px] md:w-[400px] md:h-[533px] rounded-lg" />
            </div>
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-8 w-1/3 mt-4" />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
                     <Skeleton className="h-8 w-8 rounded-full" />
                     <Skeleton className="h-5 w-20" />
                     <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!aboutData) {
    return <section id="about" className="bg-secondary py-20 text-center">No content available.</section>;
  }

  return (
    <section id="about" className="bg-secondary">
      <div className="container mx-auto flex flex-col items-center gap-12 px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{aboutData.title}</h2>
          <p className="max-w-3xl text-muted-foreground md:text-xl">
            {aboutData.description}
          </p>
        </div>

        <div className="grid gap-8 md:gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="md:col-span-1 lg:col-span-2 flex justify-center">
            <Image
              src={aboutData.aboutImage || "https://placehold.co/600x800.png"}
              alt="About Me Image"
              width={600}
              height={800}
              className="rounded-lg object-cover shadow-xl w-full max-w-[320px] sm:max-w-[400px] md:max-w-full"
              data-ai-hint="person coding"
            />
          </div>
          <div className="md:col-span-1 lg:col-span-3 space-y-6">
            <h3 className="font-headline text-2xl font-bold">{aboutData.journeyTitle}</h3>
            <p className="text-muted-foreground">
              {aboutData.journeyDescription1}
            </p>
            <p className="text-muted-foreground">
              {aboutData.journeyDescription2}
            </p>
            <h3 className="font-headline text-2xl font-bold pt-4">{aboutData.skillsetTitle}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {aboutData.skills && Object.values(aboutData.skills).map((skill: Skill) => (
                <Card key={skill.id} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader className="items-center">
                    <Icon name={skill.icon} className="h-8 w-8 text-primary" />
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
  );
}
