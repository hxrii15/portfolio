'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { portfolioAssistant } from '@/ai/flows/portfolio-assistant'
import { auth as adminAuth } from 'firebase-admin'
import { getAuth } from 'firebase/auth'
import { initializeApp, getApps } from 'firebase-admin/app'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth as clientAuth } from '@/lib/firebase'

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

const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
})

export async function signInWithEmail(data: unknown) {
  const parsed = emailLoginSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, message: 'Invalid data' }
  }

  try {
    const userCredential = await signInWithEmailAndPassword(clientAuth, parsed.data.email, parsed.data.password);
    const user = userCredential.user;

    // After successful Firebase client-side login, get the ID token
    const token = await user.getIdToken();

    // Verify the token on the server-side using Firebase Admin SDK
    const decodedToken = await adminAuth().verifyIdToken(token);
    
    if (decodedToken.email !== "hariharanmanii15@gmail.com") {
      await clientAuth.signOut();
      return { success: false, message: 'Access denied. Not an admin user.' };
    }

    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })
    return { success: true }

  } catch (error: any) {
    let message = 'An unknown authentication error occurred.';
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        message = 'Invalid email or password.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many login attempts. Please try again later.';
        break;
      default:
        console.error("Firebase Auth Error:", error);
    }
    return { success: false, message }
  }
}


export async function logout() {
  await clientAuth.signOut()
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
