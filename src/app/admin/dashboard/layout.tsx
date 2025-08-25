
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { verifyAuth } from '@/app/actions'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const { isAuthenticated } = await verifyAuth(token);
          if (isAuthenticated) {
            setLoading(false);
          } else {
            // Not the authorized admin
            await auth.signOut();
            router.replace('/admin/login');
          }
        } catch (error) {
          // Token verification failed
          await auth.signOut();
          router.replace('/admin/login');
        }
      } else {
        // Not logged in
        router.replace('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
