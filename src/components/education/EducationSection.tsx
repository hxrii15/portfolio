
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Education, Certificate } from '@/lib/data'
import { db } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { GraduationCap, Award, ExternalLink, X } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function EducationSection() {
  const [educationData, setEducationData] = useState<Education[]>([])
  const [certificatesData, setCertificatesData] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)

  useEffect(() => {
    const educationCacheKey = 'educationDataCache';
    const certificatesCacheKey = 'certificatesDataCache';
    
    try {
      const cachedEdu = localStorage.getItem(educationCacheKey);
      const cachedCert = localStorage.getItem(certificatesCacheKey);
      const now = new Date().getTime();

      if (cachedEdu) {
          const { timestamp, data } = JSON.parse(cachedEdu);
          if (now - timestamp < 24 * 60 * 60 * 1000) setEducationData(data);
      }
      if (cachedCert) {
          const { timestamp, data } = JSON.parse(cachedCert);
          if (now - timestamp < 24 * 60 * 60 * 1000) setCertificatesData(data);
      }
    } catch (e) {
        console.error("Failed to read from localStorage", e);
    }

    const educationRef = ref(db, 'education')
    const certificatesRef = ref(db, 'certificates')

    const getEndYear = (duration: string) => {
      const parts = duration.split('-');
      const lastPart = parts[parts.length - 1].trim().toLowerCase();
      if (lastPart === 'present' || lastPart === 'current') return 9999;
      const year = parseInt(lastPart.match(/\d{4}/)?.[0] || '0');
      return year;
    };

    const unsubscribeEducation = onValue(educationRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const educationList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => getEndYear(b.duration) - getEndYear(a.duration));
        setEducationData(educationList)
        localStorage.setItem(educationCacheKey, JSON.stringify({ timestamp: new Date().getTime(), data: educationList }));
      }
    });

    const unsubscribeCertificates = onValue(certificatesRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const certificatesList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).sort((a, b) => {
            const getYear = (date: string) => parseInt(date.match(/\d{4}/)?.[0] || '0');
            return getYear(b.issueDate) - getYear(a.issueDate);
          });
          setCertificatesData(certificatesList)
          localStorage.setItem(certificatesCacheKey, JSON.stringify({ timestamp: new Date().getTime(), data: certificatesList }));
        }
        setLoading(false)
    }, (error) => {
        console.error("Firebase read failed: " + error.message);
        setLoading(false);
    });

    return () => {
        unsubscribeEducation();
        unsubscribeCertificates();
    };
  }, [])

  return (
    <section id="education" className="bg-background py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Education & Certifications</h2>
          <p className="max-w-xl text-muted-foreground md:text-xl">My academic journey and professional milestones.</p>
        </div>

        <div className="space-y-24">
            {/* Education Sub-section */}
            <div className="space-y-12">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <h3 className="text-2xl md:text-3xl font-bold font-headline">Academic Education</h3>
                </div>
                
                <div className="relative">
                    {loading ? (
                        <div className="space-y-8 max-w-2xl mx-auto">
                            {[...Array(2)].map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : educationData.length > 0 ? (
                        <div className="max-w-2xl mx-auto relative">
                             <div className="hidden md:block absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-border"></div>
                             <div className="space-y-8 md:space-y-12">
                                {educationData.map((item, index) => (
                                    <div key={item.id} className={`relative flex flex-col md:flex-row items-center gap-4 md:gap-0 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                                        <div className="hidden md:block w-5/12"></div>
                                        <div className="z-10 flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background">
                                            <GraduationCap className="h-5 w-5" />
                                        </div>
                                        <div className="w-full md:w-5/12">
                                            <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-none bg-muted/30">
                                                <CardHeader className="p-5">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <CardTitle className="font-headline text-lg font-bold">{item.degree}</CardTitle>
                                                        {item.current && <Badge className="shrink-0 bg-primary/10 text-primary border-primary/20">Current</Badge>}
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground/80 mt-1">{item.institution}</p>
                                                    <p className="text-xs text-muted-foreground mt-2">{item.duration}</p>
                                                </CardHeader>
                                            </Card>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">No education information available.</p>
                    )}
                </div>
            </div>

            {/* Certificates Sub-section */}
            <div className="space-y-12">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Award className="h-8 w-8 text-primary" />
                    <h3 className="text-2xl md:text-3xl font-bold font-headline">Professional Certificates</h3>
                </div>

                <div className="max-w-4xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-40 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : certificatesData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {certificatesData.map((cert) => (
                                <Card key={cert.id} className="group overflow-hidden border-none bg-muted/30 hover:bg-muted/50 transition-all duration-300">
                                    <CardContent className="p-0 flex h-full">
                                        <div 
                                            className="w-24 md:w-32 bg-muted flex items-center justify-center cursor-pointer overflow-hidden relative"
                                            onClick={() => setSelectedCertificate(cert)}
                                        >
                                            {cert.imageUrl ? (
                                                <>
                                                    <img 
                                                        src={cert.imageUrl} 
                                                        alt={cert.name} 
                                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <ExternalLink className="text-white h-5 w-5" />
                                                    </div>
                                                </>
                                            ) : (
                                                <Award className="h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 p-5 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-bold text-base md:text-lg leading-tight line-clamp-2">{cert.name}</h4>
                                                <p className="text-sm text-foreground/70 mt-1">{cert.provider}</p>
                                            </div>
                                            <div className="mt-4 flex items-end justify-between">
                                                <p className="text-xs text-muted-foreground font-medium">{cert.issueDate}</p>
                                                {cert.certificateId && (
                                                    <span className="text-[10px] text-muted-foreground px-2 py-0.5 bg-background rounded-full border">
                                                        ID: {cert.certificateId}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">No certificates available.</p>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Certificate Detail Modal */}
      <Dialog open={!!selectedCertificate} onOpenChange={(open) => !open && setSelectedCertificate(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background border-none shadow-2xl">
            <DialogHeader className="p-6 bg-muted/30 border-b">
                <DialogTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    {selectedCertificate?.name}
                </DialogTitle>
                <div className="flex flex-wrap gap-4 mt-2">
                    <p className="text-sm font-medium">Provider: <span className="text-primary">{selectedCertificate?.provider}</span></p>
                    {selectedCertificate?.certificateId && (
                        <p className="text-sm font-medium">Credential ID: <span className="text-muted-foreground">{selectedCertificate?.certificateId}</span></p>
                    )}
                    <p className="text-sm font-medium">Issued: <span className="text-muted-foreground">{selectedCertificate?.issueDate}</span></p>
                </div>
            </DialogHeader>
            <div className="p-2 md:p-6 bg-background flex justify-center items-center">
                {selectedCertificate?.imageUrl ? (
                    <img 
                        src={selectedCertificate.imageUrl} 
                        alt={selectedCertificate.name} 
                        className="max-h-[60vh] w-auto object-contain rounded-lg shadow-md border" 
                    />
                ) : (
                    <div className="h-64 w-full flex flex-col items-center justify-center bg-muted rounded-lg border border-dashed">
                        <Award className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No certificate image available</p>
                    </div>
                )}
            </div>
            <div className="p-4 bg-muted/10 flex justify-end">
                <button 
                    onClick={() => setSelectedCertificate(null)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    Close
                </button>
            </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
