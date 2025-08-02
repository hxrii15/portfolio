import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (serviceAccount && !getApps().length) {
  initializeApp({
    credential: auth.cert(serviceAccount),
  });
}

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value

  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    try {
      const decodedToken = await getAuth().verifyIdToken(authToken);
      if (decodedToken.email !== 'hariharanmanii15@gmail.com') {
        throw new Error('Not admin');
      }
    } catch (error) {
      console.error('Auth token verification failed:', error);
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('auth-token');
      return response;
