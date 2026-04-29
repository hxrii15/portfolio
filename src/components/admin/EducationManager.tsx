
'use client'

import { useState, useEffect, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { db } from '@/lib/firebase'
import { ref, onValue, set, remove, push } from 'firebase/database'
import type { Education, Certificate } from '@/lib/data'
import { Loader2, Trash2, Edit2, X, Link, Award } from 'lucide-react'
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
    } else {
        reset({
            institution: '',
            degree: '',
            duration: '',
            current: false
        })
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
                        <Label>Degree</Label>
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

// Form for adding/editing a certificate entry
const CertificateForm = ({ onSave, initialData, onCancel }: { 
    onSave: (entry: Omit<Certificate, 'id'>) => Promise<void>, 
    initialData?: Certificate,
    onCancel?: () => void
}) => {
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<Omit<Certificate, 'id'>>({
      defaultValues: initialData || {
          name: '',
          provider: '',
          certificateId: '',
          issueDate: '',
          imageUrl: ''
      }
  })

  const previewUrl = watch('imageUrl')

  useEffect(() => {
    if (initialData) {
        reset(initialData)
    } else {
        reset({
            name: '',
            provider: '',
            certificateId: '',
            issueDate: '',
            imageUrl: ''
        })
    }
  }, [initialData, reset])

  const handleSave = async (data: Omit<Certificate, 'id'>) => {
    await onSave(data)
    if (!initialData) {
        reset()
    }
  }

  return (
    <Card className={initialData ? "border-primary/50" : "bg-muted/50"}>
        <CardHeader>
            <CardTitle>{initialData ? 'Edit Certificate' : 'Add New Certificate'}</CardTitle>
            <CardDescription>
                {initialData ? 'Update your certificate details.' : 'Fill out the form to add a new professional certificate.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
             <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Certificate Name</Label>
                        <Input {...register('name', { required: true })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Provider (e.g. Coursera, Udemy)</Label>
                        <Input {...register('provider', { required: true })} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Certificate ID / Number</Label>
                        <Input {...register('certificateId')} />
                    </div>
                    <div className="space-y-2">
                        <Label>Issue Date / Duration</Label>
                        <Input placeholder="e.g., Oct 2023" {...register('issueDate', { required: true })} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Certificate Image URL</Label>
                    <div className="flex items-start gap-4">
                        <div className="relative group flex-shrink-0">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="h-20 w-20 object-cover rounded-md border" />
                            ) : (
                                <div className="h-20 w-20 bg-muted flex items-center justify-center rounded-md border border-dashed">
                                    <Award className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="relative">
                                <Link className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    className="pl-9"
                                    placeholder="https://cloudinary.com/..." 
                                    {...register('imageUrl', { 
                                        required: "Image URL is required",
                                        pattern: {
                                            value: /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i,
                                            message: "Please enter a valid image URL"
                                        }
                                    })} 
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Paste a URL from Cloudinary, Imgur, or any hosting service.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                     {onCancel && (
                         <Button type="button" variant="outline" onClick={onCancel}>
                             Cancel
                         </Button>
                     )}
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Update Certificate' : 'Add Certificate'}
                    </Button>
                </div>
             </form>
        </CardContent>
    </Card>
  )
}

export function EducationManager() {
  const [educationData, setEducationData] = useState<Education[]>([])
  const [certificatesData, setCertificatesData] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEducation, setEditingEducation] = useState<Education | null>(null)
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null)
  const { toast } = useToast()
  
  useEffect(() => {
    const educationRef = ref(db, 'education');
    const certificatesRef = ref(db, 'certificates');

    const getEndYear = (duration: string) => {
        if (!duration) return 0;
        const parts = duration.split('-');
        const lastPart = parts[parts.length - 1].trim().toLowerCase();
        if (lastPart === 'present' || lastPart === 'current') return 9999;
        const match = lastPart.match(/\d{4}/);
        return match ? parseInt(match[0]) : 0;
    };

    const unsubscribeEducation = onValue(educationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const educationList = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })).sort((a, b) => getEndYear(b.duration) - getEndYear(a.duration));
        setEducationData(educationList);
      } else {
        setEducationData([])
      }
      setLoading(false);
    });

    const unsubscribeCertificates = onValue(certificatesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const certificatesList = Object.keys(data).map(key => ({
            ...data[key],
            id: key
          })).sort((a, b) => {
            // Sort by issueDate descending
            const getYear = (date: string) => {
                if (!date) return 0;
                const match = date.match(/\d{4}/);
                return match ? parseInt(match[0]) : 0;
            };
            return getYear(b.issueDate) - getYear(a.issueDate);
          });
          setCertificatesData(certificatesList);
        } else {
          setCertificatesData([])
        }
        setLoading(false);
    }, (error) => {
        console.error("Firebase certificates read failed:", error);
        setLoading(false);
    });

    return () => {
        unsubscribeEducation();
        unsubscribeCertificates();
    };
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
      if (!editingEducation) return;
      try {
          // Ensure we don't save the id field inside the data node
          const { id, ...dataToSave } = updatedEntry as any;
          await set(ref(db, `education/${editingEducation.id}`), dataToSave);
          toast({ title: 'Success', description: 'Education entry updated.' });
          setEditingEducation(null);
      } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to update entry.' });
      }
  }
  
  const handleRemoveEducation = async (id: string) => {
      if (!id) return;

      if (confirm('Are you sure you want to delete this entry?')) {
          try {
            const entryRef = ref(db, `education/${id}`);
            await remove(entryRef);

            // Update local state immediately for better UX
            setEducationData(prev => prev.filter(item => item.id !== id));

            toast({ title: 'Success', description: 'Education entry deleted.' });
          } catch (error) {
            console.error("Delete failed:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete entry.' });
          }
      }
  }

  const handleAddCertificate = async (newEntry: Omit<Certificate, 'id'>) => {
    try {
        const newEntryRef = push(ref(db, 'certificates'));
        await set(newEntryRef, newEntry);
        toast({ title: 'Success', description: 'New certificate added.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to add certificate.' });
    }
  }

  const handleUpdateCertificate = async (updatedEntry: Omit<Certificate, 'id'>) => {
    if (!editingCertificate) return;
    try {
        // Ensure we don't save the id field inside the data node
        const { id, ...dataToSave } = updatedEntry as any;
        await set(ref(db, `certificates/${editingCertificate.id}`), dataToSave);
        toast({ title: 'Success', description: 'Certificate updated.' });
        setEditingCertificate(null);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update certificate.' });
    }
  }

  const handleRemoveCertificate = async (id: string) => {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this certificate?')) {
        try {
          // Perform the deletion
          const certRef = ref(db, `certificates/${id}`);
          await remove(certRef);
          
          // Update local state immediately for better UX
          setCertificatesData(prev => prev.filter(item => item.id !== id));
          
          toast({ title: 'Success', description: 'Certificate deleted.' });
        } catch (error) {
          console.error("Delete failed:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete certificate.' });
        }
    }
  }

  return (
    <div className="space-y-12">
        {/* Education Section */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold border-b pb-2">Academic Degrees</h2>
            {editingEducation ? (
                <EducationForm 
                    onSave={handleUpdateEducation} 
                    initialData={editingEducation} 
                    onCancel={() => setEditingEducation(null)} 
                />
            ) : (
                <EducationForm onSave={handleAddEducation} />
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Existing Degrees</CardTitle>
                    <CardDescription>Manage your academic qualifications.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-48 w-full" />
                    ) : educationData.length > 0 ? (
                        <div className="border rounded-md">
                            {educationData.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                                    <div>
                                        <p className="font-bold">{item.degree}</p>
                                        <p className="text-sm font-normal text-foreground/80">{item.institution}</p>
                                        <p className="text-sm text-muted-foreground">{item.duration} {item.current && <span className="text-primary font-semibold">(Current)</span>}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => setEditingEducation(item)}>
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

        {/* Certificates Section */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold border-b pb-2">Certificates</h2>
            {editingCertificate ? (
                <CertificateForm 
                    onSave={handleUpdateCertificate} 
                    initialData={editingCertificate} 
                    onCancel={() => setEditingCertificate(null)} 
                />
            ) : (
                <CertificateForm onSave={handleAddCertificate} />
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Existing Certificates</CardTitle>
                    <CardDescription>Manage your professional certifications.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-48 w-full" />
                    ) : certificatesData.length > 0 ? (
                        <div className="border rounded-md">
                            {certificatesData.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="h-10 w-10 object-cover rounded border" />
                                        ) : (
                                            <div className="h-10 w-10 bg-muted flex items-center justify-center rounded border">
                                                <Award className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold">{item.name}</p>
                                            <p className="text-sm font-normal text-foreground/80">{item.provider}</p>
                                            <p className="text-xs text-muted-foreground">{item.issueDate} {item.certificateId && `• ID: ${item.certificateId}`}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => setEditingCertificate(item)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveCertificate(item.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No certificates found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
