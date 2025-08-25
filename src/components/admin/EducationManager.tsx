
'use client'

import { useState } from 'react'
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { educationData as initialEducationData } from '@/lib/data'
import { Edit, Trash2, PlusCircle } from 'lucide-react'

export function EducationManager() {
  const [educationData, setEducationData] = useState(initialEducationData)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEducation, setSelectedEducation] = useState<any>(null)

  const handleEdit = (item: any) => {
    setSelectedEducation(item)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (item: any) => {
    setSelectedEducation(item)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    // Note: This only updates the state. It won't persist without a backend.
    setEducationData(educationData.filter(e => e.institution !== selectedEducation.institution))
    setIsDeleteDialogOpen(false)
    setSelectedEducation(null)
  }
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to save the edited item. For now, it just closes the dialog.
    // To persist, you'd update state and call a backend API.
    setIsEditDialogOpen(false);
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button>
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
            {educationData.map((item) => (
              <TableRow key={item.institution}>
                <TableCell className="font-medium">{item.institution}</TableCell>
                <TableCell>{item.degree}</TableCell>
                <TableCell>{item.duration}</TableCell>
                <TableCell>{item.current ? 'Yes' : 'No'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Education</DialogTitle>
          </DialogHeader>
          {selectedEducation && (
            <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="institution" className="text-right">Institution</Label>
                  <Input id="institution" defaultValue={selectedEducation.institution} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="degree" className="text-right">Degree</Label>
                  <Input id="degree" defaultValue={selectedEducation.degree} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">Duration</Label>
                  <Input id="duration" defaultValue={selectedEducation.duration} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="current" className="text-right">Current</Label>
                  <Checkbox id="current" defaultChecked={selectedEducation.current} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          )}
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
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
