
'use client'

import { useState, useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/lib/firebase'
import { ref, onValue, set, push, remove } from 'firebase/database'
import type { AboutData, Skill } from '@/lib/data'
import { Loader2, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '../ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'

// Separate form for adding a new skill
const AddSkillForm = ({ onAdd }: { onAdd: (skill: Omit<Skill, 'id'>) => Promise<void> }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Omit<Skill, 'id'>>()

  const handleAdd = async (data: Omit<Skill, 'id'>) => {
    await onAdd(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleAdd)} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-md bg-muted/50">
        <div className="col-span-12 sm:col-span-3 space-y-2">
            <Label>Icon Name</Label>
            <Input placeholder="e.g. Code" {...register('icon', { required: true })} />
        </div>
        <div className="col-span-12 sm:col-span-3 space-y-2">
            <Label>Skill Name</Label>
            <Input placeholder="e.g. Frontend" {...register('name', { required: true })} />
        </div>
        <div className="col-span-12 sm:col-span-4 space-y-2">
            <Label>Description</Label>
            <Input placeholder="e.g. React, Next.js" {...register('description', { required: true })} />
        </div>
        <div className="col-span-12 sm:col-span-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Skill
            </Button>
        </div>
    </form>
  )
}

export function AboutManager() {
  const [loading, setLoading] = useState(true)
  const [isSaving, startSavingTransition] = useTransition()
  const { toast } = useToast()
  const { register, handleSubmit, reset, watch, setValue } = useForm<Omit<AboutData, 'skills'>>()

  const aboutImage = watch('aboutImage')
  const [skills, setSkills] = useState<Skill[]>([])

  useEffect(() => {
    const aboutRef = ref(db, 'about');
    const unsubscribe = onValue(aboutRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        reset(data)
        setSkills(data.skills ? Object.keys(data.skills).map(key => ({ id: key, ...data.skills[key] })) : [])
      } else {
        reset({
          title: "About Me",
          description: "A lifelong learner with a passion for turning complex problems into elegant, user-friendly software solutions.",
          journeyTitle: "My Journey & Philosophy",
          journeyDescription1: "From my first \"Hello, World!\" to architecting scalable cloud applications, my journey in technology has been driven by curiosity and a desire to create. I believe in the power of clean code, thoughtful design, and continuous improvement. I thrive in collaborative environments where I can both learn from and mentor my peers.",
          journeyDescription2: "Beyond the code, I'm an avid reader, a hobbyist photographer, and I enjoy exploring the intersection of art and artificial intelligence. I'm always on the lookout for new challenges and opportunities to grow.",
          skillsetTitle: "My Skillset",
          aboutImage: "https://placehold.co/600x800.png",
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [reset]);

  const onAboutSubmit = (data: Omit<AboutData, 'skills'>) => {
    startSavingTransition(async () => {
      try {
        const currentSkills = skills.reduce((acc, skill) => {
            const {id, ...rest} = skill
            acc[id] = rest
            return acc
        }, {} as Record<string, Omit<Skill, 'id'>>)

        await set(ref(db, 'about'), { ...data, skills: currentSkills });
        toast({ title: 'Success', description: 'About page content updated.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update content.' });
      }
    });
  };

  const handleAddSkill = async (newSkill: Omit<Skill, 'id'>) => {
    try {
      const newSkillRef = push(ref(db, 'about/skills'));
      await set(newSkillRef, newSkill);
      toast({ title: 'Success', description: 'New skill added.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add skill.' });
    }
  }

  const handleRemoveSkill = async (skillId: string) => {
    try {
      await remove(ref(db, `about/skills/${skillId}`));
      toast({ title: 'Success', description: 'Skill removed.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove skill.' });
    }
  }
  
  if (loading) {
    return <Skeleton className="h-96 w-full" />
  }

  return (
    <div className="space-y-6">
        <form onSubmit={handleSubmit(onAboutSubmit)} className="space-y-6">
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
             <div className="space-y-2">
                <Label htmlFor="skillsetTitle">Skillset Title</Label>
                <Input id="skillsetTitle" {...register('skillsetTitle')} />
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save About Content
                </Button>
            </div>
        </form>
      
      <Card>
        <CardHeader>
            <CardTitle>Manage Skills</CardTitle>
            <CardDescription>Add new skills one by one. They are saved directly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <AddSkillForm onAdd={handleAddSkill} />
            <div className="space-y-2">
                <h4 className="font-medium">Existing Skills</h4>
                 {skills.length > 0 ? (
                    <div className="border rounded-md">
                        {skills.map((skill) => (
                             <div key={skill.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                                <div className="flex items-center gap-4">
                                   <span className="font-mono text-xs p-1 bg-muted rounded">{skill.icon}</span>
                                   <div>
                                     <p className="font-semibold">{skill.name}</p>
                                     <p className="text-sm text-muted-foreground">{skill.description}</p>
                                   </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveSkill(skill.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                             </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center p-4">No skills added yet.</p>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
