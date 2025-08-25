
'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { portfolioAssistant } from '@/ai/flows/portfolio-assistant'
import { credential } from 'firebase-admin'
import { initializeApp, getApps, App } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Admin features will be disabled.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    return initializeApp({
      credential: credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Failed to parse or use FIREBASE_SERVICE_ACCOUNT_KEY:", error);
    throw new Error('Server configuration error. Could not initialize Firebase Admin SDK.');
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

export async function verifyAuth(token: string | null): Promise<{ isAuthenticated: boolean; email?: string | null }> {
  if (!token) {
    return { isAuthenticated: false };
  }

  try {
    const adminApp = getAdminApp();
    const decodedToken = await getAdminAuth(adminApp).verifyIdToken(token);
    
    if (decodedToken.email === 'hariharanmanii15@gmail.com') {
      // Set a server-side cookie for subsequent server-side checks if needed
      cookies().set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      })
      return { isAuthenticated: true, email: decodedToken.email };
    }
    
    return { isAuthenticated: false };
  } catch (error) {
    console.error('Auth token verification failed:', error);
    // Clear the cookie if verification fails
    cookies().delete('auth-token');
    return { isAuthenticated: false };
  }
}
