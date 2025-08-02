
'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { portfolioAssistant } from '@/ai/flows/portfolio-assistant'
import { auth as adminAuth } from 'firebase-admin'
import { getAuth } from 'firebase/auth'
import { initializeApp, getApps } from 'firebase-admin/app'
import { auth } from '@/lib/firebase'

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;

  if (serviceAccount) {
    initializeApp({
      credential: adminAuth.cert(serviceAccount),
    });
  }
}

export async function createSession(idToken: string) {
  try {
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    
    if (decodedToken.email !== "hariharanmanii15@gmail.com") {
      return { success: false, message: 'Access denied. Not an admin user.' };
    }

    cookies().set('auth-token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })
    return { success: true }

  } catch (error: any) {
    console.error("Session creation failed:", error);
    return { success: false, message: 'Failed to create a session.' }
  }
}


export async function logout() {
  cookies().delete('auth-token')
}

const aiSchema = z.object({
  query: z.string().min(1),
})

export async function askAI(data: unknown) {
  const parsed = aiSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: 'Invalid query.' };
  }

  try {
    const result = await portfolioAssistant({ query: parsed.data.query });
    return { success: true, response: result.response };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'An error occurred with the AI assistant.' };
  }
}

export async function verifyAuth() {
  const authToken = cookies().get('auth-token')?.value;

  if (!authToken) {
    return { isAuthenticated: false };
  }

  try {
    const decodedToken = await adminAuth().verifyIdToken(authToken);
    if (decodedToken.email === 'hariharanmanii15@gmail.com') {
      return { isAuthenticated: true, email: decodedToken.email };
    }
    return { isAuthenticated: false };
  } catch (error) {
    console.error('Auth token verification failed:', error);
    return { isAuthenticated: false };
  }
}
