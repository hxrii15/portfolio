'use client'

import { useState, useEffect, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { db } from '@/lib/firebase'
import { ref, onValue, set, remove, push } from 'firebase/database'
import type { Education } from '@/lib/data'
import { Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function EducationManager() {
  const [educationData, setEducationData] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const { register, handleSubmit, reset, control } = useForm<Omit<Education, 'id'>>()

  useEffect(() => {
    const educationRef = ref(db, 'education');
    const unsubscribe = onValue(educationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const educationList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setEducationData(educationList);
      } else {
        setEducationData([])
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenForm = (item: Education | null = null) => {
    setSelectedEducation(item)
    reset(item || { institution: '', degree: '', duration: '', current: false })
    setIsFormOpen(true)
  }

  const handleDelete = (item: Education) => {
    setSelectedEducation(item)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedEducation) return;
    startTransition(async () => {
      try {
        await remove(ref(db, `education/${selectedEducation.id}`));
        toast({ title: 'Success', description: 'Education entry deleted.' });
        setIsDeleteDialogOpen(false);
        setSelectedEducation(null);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete entry.' });
      }
    });
  }

  const onSubmit = (data: Omit<Education, 'id'>) => {
    startTransition(async () => {
      try {
        const id = selectedEducation?.id || push(ref(db, 'education')).key;
        await set(ref(db, `education/${id}`), data);
        toast({ title: 'Success', description: 'Education entry saved.' });
        setIsFormOpen(false);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save entry.' });
      }
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Institution</TableHead>
              <TableHead>Degree</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Current</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : educationData.length > 0 ? (
              educationData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.institution}</TableCell>
                  <TableCell>{item.degree}</TableCell>
                  <TableCell>{item.duration}</TableCell>
                  <TableCell>{item.current ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
               <TableRow>
                <TableCell colSpan={5} className="text-center">No education entries found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEducation ? 'Edit' : 'Add'} Education</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="institution" className="text-right">Institution</Label>
                <Input id="institution" {...register('institution', { required: true })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="degree" className="text-right">Degree</Label>
                <Input id="degree" {...register('degree', { required: true })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">Duration</Label>
                <Input id="duration" {...register('duration', { required: true })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current" className="text-right">Current</Label>
                <Controller
                  name="current"
                  control={control}
                  render={({ field }) => (
                    <Checkbox id="current" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the education entry for "{selectedEducation?.institution}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)} disabled={isPending}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
