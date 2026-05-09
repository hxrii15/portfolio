'use client'

import { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { db, storage } from '@/lib/firebase'
import { ref as dbRef, onValue, set, remove } from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { Loader2, FileText, Upload, Trash2, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import type { CVData } from '@/lib/data'

export function CVManager() {
  const [cvData, setCvData] = useState<CVData | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [manualUrl, setManualUrl] = useState('')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    const cvReference = dbRef(db, 'cv');
    const unsubscribe = onValue(cvReference, (snapshot) => {
      const data = snapshot.val();
      setCvData(data);
      setLoading(false);
    }, (error) => {
      console.error("Firebase CV read failed:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({ 
        variant: 'destructive', 
        title: 'Invalid File', 
        description: 'Please upload a PDF, JPG, PNG, or DOC/DOCX file.' 
      });
      return;
    }

    setUploading(true);
    try {
      const extension = file.name.split('.').pop();
      const resumeRef = storageRef(storage, `cv/resume.${extension}`);
      
      // Upload file
      await uploadBytes(resumeRef, file);
      const url = await getDownloadURL(resumeRef);

      // Save to database
      await set(dbRef(db, 'cv'), {
        url,
        fileName: file.name,
        storagePath: `cv/resume.${extension}`,
        uploadedAt: Date.now()
      });

      toast({ title: 'Success', description: 'CV uploaded successfully.' });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload CV.' });
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  }

  const handleSaveManualUrl = () => {
    if (!manualUrl) return;
    startTransition(async () => {
      try {
        await set(dbRef(db, 'cv'), {
          url: manualUrl,
          fileName: 'Manual Link',
          uploadedAt: Date.now()
        });
        toast({ title: 'Success', description: 'CV link saved.' });
        setManualUrl('');
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save link.' });
      }
    });
  }

  const handleDeleteCV = () => {
    if (!cvData) return;
    if (!confirm('Are you sure you want to delete your CV?')) return;

    startTransition(async () => {
      try {
        // If it was a stored file (not a manual link), try to delete it from storage
        if (cvData.storagePath) {
           try {
             const fileRef = storageRef(storage, cvData.storagePath);
             await deleteObject(fileRef);
           } catch (e) {
             console.warn("Storage deletion failed, continuing with DB deletion", e);
           }
        }
        
        await remove(dbRef(db, 'cv'));
        toast({ title: 'Success', description: 'CV deleted successfully.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete CV.' });
      }
    });
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {cvData ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Current CV</CardTitle>
                  <CardDescription className="text-xs">
                    Uploaded: {new Date(cvData.uploadedAt).toLocaleString()}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={cvData.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" /> View
                  </a>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteCV} disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />} Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium truncate mb-1">File: {cvData.fileName}</p>
            <p className="text-xs text-muted-foreground truncate">{cvData.url}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center p-8 border-2 border-dashed rounded-lg bg-muted/30">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No CV uploaded yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload / Update File</CardTitle>
            <CardDescription>PDF, JPG, PNG, DOC (Max 5MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="cv-upload">Select File</Label>
              <div className="flex gap-2">
                <Input 
                  id="cv-upload" 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                <Upload className="h-4 w-4 animate-bounce" /> Uploading...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paste Link Instead</CardTitle>
            <CardDescription>Google Drive, Dropbox, or custom URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="manual-url">Direct URL</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="manual-url" 
                    placeholder="https://..." 
                    className="pl-9"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveManualUrl} disabled={!manualUrl || isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
