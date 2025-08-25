
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { logout } from '@/app/actions'
import { Loader2, LogOut, Briefcase, GraduationCap, BookOpen } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EducationManager } from '@/components/admin/EducationManager'
import { ProjectsManager } from '@/components/admin/ProjectsManager'
import { BlogManager } from '@/components/admin/BlogManager'

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await auth.signOut()
      await logout()
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' })
      router.replace('/admin/login')
    })
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-background border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl font-bold">Admin Dashboard</span>
          </div>
          <Button onClick={handleLogout} disabled={isPending} variant="outline">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Logout
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        <Tabs defaultValue="projects">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
            <TabsTrigger value="projects">
              <Briefcase className="mr-2 h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="education">
              <GraduationCap className="mr-2 h-4 w-4" />
              Education
            </TabsTrigger>
            <TabsTrigger value="blog">
              <BookOpen className="mr-2 h-4 w-4" />
              Blog
            </TabsTrigger>
          </TabsList>
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Manage Projects</CardTitle>
                <CardDescription>Edit, delete, or add new project entries.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectsManager />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Manage Education</CardTitle>
                <CardDescription>Edit, delete, or add new education entries.</CardDescription>
              </CardHeader>
              <CardContent>
                <EducationManager />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="blog">
            <Card>
              <CardHeader>
                <CardTitle>Manage Blog Posts</CardTitle>
                <CardDescription>Edit, delete, or add new blog posts.</CardDescription>
              </CardHeader>
              <CardContent>
                <BlogManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
