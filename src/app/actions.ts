'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { portfolioAssistant } from '@/ai/flows/portfolio-assistant'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

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
    const userCredential = await signInWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
    const user = userCredential.user;

    if (user && user.email === "hariharanmanii15@gmail.com") {
      const token = await user.getIdToken();
      cookies().set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      })
      return { success: true }
    } else {
      // Sign out the user if they are not the admin
      await auth.signOut();
      return { success: false, message: 'Access denied. Not an admin user.' }
    }
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
    }
    return { success: false, message }
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
    return { success: false, message: 'An error occurred with the