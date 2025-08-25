
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { logout } from '@/app/actions'
import { Loader2, LogOut, Briefcase, GraduationCap, BookOpen, Home, User, Feather } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EducationManager } from '@/components/admin/EducationManager'
import { ProjectsManager } from '@/components/admin/ProjectsManager'
import { HomeManager } from '@/components/admin/HomeManager'
import { AboutManager } from '@/components/admin/AboutManager'
import { PoemManager } from '@/components/admin/PoemManager'

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
        <Tabs defaultValue="home">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto">
            <TabsTrigger value="home">
              <Home className="mr-2 h-4 w-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="about">
              <User className="mr-2 h-4 w-4" />
              About
            </TabsTrigger>
            <TabsTrigger value="projects">
              <Briefcase className="mr-2 h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="education">
              <GraduationCap className="mr-2 h-4 w-4" />
              Education
            </TabsTrigger>
             <TabsTrigger value="poem">
              <Feather className="mr-2 h-4 w-4" />
              Poems
            </TabsTrigger>
          </TabsList>
          <TabsContent value="home">
            <Card>
              <CardHeader>
                <CardTitle>Manage Home Page</CardTitle>
                <CardDescription>Edit the content of the home section.</CardDescription>
              </CardHeader>
              <CardContent>
                <HomeManager />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Manage About Page</CardTitle>
                <CardDescription>Edit the content of the about section.</CardDescription>
              </CardHeader>
              <CardContent>
                <AboutManager />
              </CardContent>
            </Card>
          </TabsContent>
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
          <TabsContent value="poem">
            <Card>
              <CardHeader>
                <CardTitle>Manage Poems</CardTitle>
                <CardDescription>Edit, delete, or add new poems.</CardDescription>
              </CardHeader>
              <CardContent>
                <PoemManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
