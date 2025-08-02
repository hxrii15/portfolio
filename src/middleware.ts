import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value

  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    if (!authToken || authToken !== process.env.ADMIN_AUTH_TOKEN) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard'],
}
