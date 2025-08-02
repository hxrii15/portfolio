
import { verifyAuth } from '@/app/actions'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = await verifyAuth()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return <>{children}</>
}
