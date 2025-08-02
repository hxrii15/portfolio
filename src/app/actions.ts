
'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { portfolioAssistant } from '@/ai/flows/portfolio-assistant'
import { credential } from 'firebase-admin'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey)
      initializeApp({
        credential: credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
    }
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Admin features will be disabled.");
  }
}

export async function createSession(idToken: string) {
  if (!getApps().length) {
    return { success: false, message: 'Server is not configured for authentication.' };
  }
  try {
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    
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
    return { success: false, message: 'Failed to create a session. Please check server logs.' }
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

  if (!authToken || !getApps().length) {
    return { isAuthenticated: false };
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(authToken);
    if (decodedToken.email === 'hariharanmanii15@gmail.com') {
      return { isAuthenticated: true, email: decodedToken.email };
    }
    return { isAuthenticated: false };
  } catch (error) {
    console.error('Auth token verification failed:', error);
    return { isAuthenticated: false };
  }
}
