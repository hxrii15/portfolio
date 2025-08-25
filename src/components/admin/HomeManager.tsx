'use client'

import { useState, useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/lib/firebase'
import { ref, onValue, set } from 'firebase/database'
import type { HomeData } from '@/lib/data'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '../ui/skeleton'

export function HomeManager() {
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const { register, handleSubmit, reset, watch } = useForm<HomeData>()

  const profileImage = watch('profileImage')

  useEffect(() => {
    const homeRef = ref(db, 'home');
    const unsubscribe = onValue(homeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        reset(data);
      } else {
        // Set default values if no data exists
        reset({
          name: 'Hariharan',
          roles: ['Full Stack Developer', 'AI Enthusiast', 'Creative Coder'],
          description: "A passionate developer and AI enthusiast dedicated to building innovative solutions that push the boundaries of technology. Welcome to my digital space.",
          profileImage: 'https://placehold.co/500x500.png'
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [reset]);

  const onSubmit = (data: HomeData) => {
    startTransition(async () => {
      try {
        // If roles is a string, convert it to an array
        const roles = Array.isArray(data.roles) ? data.roles : (data.roles as unknown as string).split(',').map(r => r.trim());

        await set(ref(db, 'home'), { ...data, roles });
        toast({ title: 'Success', description: 'Home page content updated.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update content.' });
      }
    });
  };

  if (loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end">
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    )
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="roles">Roles (comma-separated)</Label>
        <Input id="roles" {...register('roles')} />
      </div>
       <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} rows={4} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profileImage">Profile Image URL</Label>
        <Input id="profileImage" {...register('profileImage')} />
        {profileImage && (
            <img src={profileImage} alt="Profile Preview" className="mt-2 h-32 w-32 rounded-full object-cover"/>
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
