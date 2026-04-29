
'use client'

import { useState, useEffect, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { db } from '@/lib/firebase'
import { ref, onValue, set, remove, push } from 'firebase/database'
import type { Education } from '@/lib/data'
import { Loader2, Trash2, Edit2, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

// Form for adding/editing an education entry
const EducationForm = ({ onSave, initialData, onCancel }: { 
    onSave: (entry: Omit<Education, 'id'>) => Promise<void>, 
    initialData?: Education,
    onCancel?: () => void
}) => {
  const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm<Omit<Education, 'id'>>({
      defaultValues: initialData || {
          institution: '',
          degree: '',
          duration: '',
          current: false
      }
  })

  useEffect(() => {
    if (initialData) {
        reset(initialData)
    }
  }, [initialData, reset])

  const handleSave = async (data: Omit<Education, 'id'>) => {
    await onSave(data)
    if (!initialData) reset()
  }

  return (
    <Card className={initialData ? "border-primary/50" : "bg-muted/50"}>
        <CardHeader>
            <CardTitle>{initialData ? 'Edit Education' : 'Add New Education'}</CardTitle>
            <CardDescription>
                {initialData ? 'Update your education entry details.' : 'Fill out the form to add a new education entry to your timeline.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
             <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input {...register('institution', { required: true })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Degree/Certificate</Label>
                        <Input {...register('degree', { required: true })} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input placeholder="e.g., 2020 - 2024" {...register('duration', { required: true })} />
                </div>
                <div className="flex items-center space-x-2">
                     <Controller
                        name="current"
                        control={control}
                        render={({ field }) => (
                            <Checkbox id={initialData ? `current-${initialData.id}` : "current"} checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                    <Label htmlFor={initialData ? `current-${initialData.id}` : "current"}>Is this your current place of study?</Label>
                </div>
                <div className="flex justify-end gap-2">
                     {onCancel && (
                         <Button type="button" variant="outline" onClick={onCancel}>
                             Cancel
                         </Button>
                     )}
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Update Entry' : 'Add Entry'}
                    </Button>
                </div>
             </form>
        </CardContent>
    </Card>
  )
}

export function EducationManager() {
  const [educationData, setEducationData] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<Education | null>(null)
  const { toast } = useToast()
  
  useEffect(() => {
    const educationRef = ref(db, 'education');
    const unsubscribe = onValue(educationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const educationList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => a.duration.localeCompare(b.duration));
        setEducationData(educationList);
      } else {
        setEducationData([])
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddEducation = async (newEntry: Omit<Education, 'id'>) => {
    try {
        const newEntryRef = push(ref(db, 'education'));
        await set(newEntryRef, newEntry);
        toast({ title: 'Success', description: 'New education entry added.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to add entry.' });
    }
  }
  
  const handleUpdateEducation = async (updatedEntry: Omit<Education, 'id'>) => {
      if (!editingItem) return;
      try {
          await set(ref(db, `education/${editingItem.id}`), updatedEntry);
          toast({ title: 'Success', description: 'Education entry updated.' });
          setEditingItem(null);
      } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to update entry.' });
      }
  }
  
  const handleRemoveEducation = async (id: string) => {
      if (confirm('Are you sure you want to delete this entry?')) {
          try {
            await remove(ref(db, `education/${id}`));
            toast({ title: 'Success', description: 'Education entry deleted.' });
          } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete entry.' });
          }
      }
  }

  return (
    <div className="space-y-6">
        {editingItem ? (
            <EducationForm 
                onSave={handleUpdateEducation} 
                initialData={editingItem} 
                onCancel={() => setEditingItem(null)} 
            />
        ) : (
            <EducationForm onSave={handleAddEducation} />
        )}

        <Card>
            <CardHeader>
                <CardTitle>Existing Entries</CardTitle>
                <CardDescription>Manage your current education entries.</CardDescription>
            </CardHeader>
            <CardContent>
                 {loading ? (
                    <Skeleton className="h-48 w-full" />
                ) : educationData.length > 0 ? (
                    <div className="border rounded-md">
                        {educationData.map((item) => (
                             <div key={item.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                                <div>
                                    <p className="font-bold">{item.institution} - {item.degree}</p>
                                    <p className="text-sm text-muted-foreground">{item.duration} {item.current && <span className="text-primary font-semibold">(Current)</span>}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveEducation(item.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                             </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">No education entries found.</p>
                )}
            </CardContent>
        </Card>
    </div>
  )
}
