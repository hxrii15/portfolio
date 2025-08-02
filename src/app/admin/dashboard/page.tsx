'use client'

import { useTransition, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { logout, verifyAuth } from '@/app/actions'
import { Loader2, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await verifyAuth();
      if (!isAuthenticated) {
        router.replace('/admin/login');
      } else {
        setIsVerifying(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' })
      router.push('/admin/login')
    })
  }
  
  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>Welcome to the admin area.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This is a protected area. You can manage portfolio content here in the future.</p>
          <Button onClick={handleLogout} disabled={isPending} className="w-full">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
