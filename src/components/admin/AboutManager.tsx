'use client'

import { useState, useEffect, useTransition } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/lib/firebase'
import { ref, onValue, set, push, remove } from 'firebase/database'
import type { AboutData } from '@/lib/data'
import { Loader2, Trash2, PlusCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '../ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export function AboutManager() {
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const { register, handleSubmit, reset, control, watch } = useForm<AboutData>()

  const aboutImage = watch('aboutImage');

  const { fields, append, remove: removeSkill } = useFieldArray({
    control,
    name: "skills",
  });

  useEffect(() => {
    const aboutRef = ref(db, 'about');
    const unsubscribe = onValue(aboutRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase returns skills as an object, convert to array for useFieldArray
        const skillsArray = data.skills ? Object.values(data.skills) : [];
        reset({ ...data, skills: skillsArray });
      } else {
        reset({
          title: "About Me",
          description: "A lifelong learner with a passion for turning complex problems into elegant, user-friendly software solutions.",
          journeyTitle: "My Journey & Philosophy",
          journeyDescription1: "From my first \"Hello, World!\" to architecting scalable cloud applications, my journey in technology has been driven by curiosity and a desire to create. I believe in the power of clean code, thoughtful design, and continuous improvement. I thrive in collaborative environments where I can both learn from and mentor my peers.",
          journeyDescription2: "Beyond the code, I'm an avid reader, a hobbyist photographer, and I enjoy exploring the intersection of art and artificial intelligence. I'm always on the lookout for new challenges and opportunities to grow.",
          skillsetTitle: "My Skillset",
          aboutImage: "https://placehold.co/600x800.png",
          skills: []
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [reset]);

  const onSubmit = (data: AboutData) => {
    startTransition(async () => {
      try {
        await set(ref(db, 'about'), data);
        toast({ title: 'Success', description: 'About page content updated.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update content.' });
      }
    });
  };
  
  if (loading) {
    return <Skeleton className="h-96 w-full" />
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Section Title</Label>
        <Input id="title" {...register('title')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Section Description</Label>
        <Textarea id="description" {...register('description')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="aboutImage">About Image URL</Label>
        <Input id="aboutImage" {...register('aboutImage')} />
        {aboutImage && (
            <img src={aboutImage} alt="About Preview" className="mt-2 h-48 w-auto rounded-md object-cover"/>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="journeyTitle">Journey Title</Label>
        <Input id="journeyTitle" {...register('journeyTitle')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="journeyDescription1">Journey Paragraph 1</Label>
        <Textarea id="journeyDescription1" {...register('journeyDescription1')} rows={4} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="journeyDescription2">Journey Paragraph 2</Label>
        <Textarea id="journeyDescription2" {...register('journeyDescription2')} rows={4} />
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Manage Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-md">
                    <Input {...register(`skills.${index}.id`)} type="hidden" />
                    <div className="col-span-12 sm:col-span-3 space-y-2">
                        <Label>Icon Name</Label>
                        <Input placeholder="e.g. Code" {...register(`skills.${index}.icon`)} />
                    </div>
                    <div className="col-span-12 sm:col-span-3 space-y-2">
                        <Label>Skill Name</Label>
                        <Input placeholder="e.g. Frontend" {...register(`skills.${index}.name`)} />
                    </div>
                    <div className="col-span-12 sm:col-span-5 space-y-2">
                        <Label>Description</Label>
                        <Input placeholder="e.g. React, Next.js" {...register(`skills.${index}.description`)} />
                    </div>
                    <div className="col-span-12 sm:col-span-1">
                        <Button variant="destructive" size="icon" onClick={() => removeSkill(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
             <Button type="button" variant="outline" onClick={() => append({ id: push(ref(db, 'about/skills')).key!, name: '', icon: 'Code', description: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
            </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
