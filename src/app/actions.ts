
'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { portfolioAssistant } from '@/ai/flows/portfolio-assistant'
import { credential } from 'firebase-admin'
import { initializeApp, getApps, App } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'

function getAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Admin features will be disabled.');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    return initializeApp({
      credential: credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Failed to parse or use FIREBASE_SERVICE_ACCOUNT_KEY:", error);
    return null;
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

  const adminApp = getAdminApp();
  if (!adminApp) {
    return { isAuthenticated: false };
  }

  try {
    const decodedToken = await getAdminAuth(adminApp).verifyIdToken(token);
    
    if (decodedToken.email === 'hariharanmanii15@gmail.com') {
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
    cookies().delete('auth-token');
    return { isAuthenticated: false };
  }
}
