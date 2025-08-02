'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { portfolioAssistant } from '@/ai/flows/portfolio-assistant'


const googleLoginSchema = z.object({
  email: z.string().email(),
})

export async function signInWithGoogle(data: unknown) {
  const parsed = googleLoginSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, message: 'Invalid data' }
  }

  // In a production app, you would verify the ID token here with the Firebase Admin SDK.
  // For this prototype, we'll trust the email from the client, but only if it's the admin email.
  if (parsed.data.email === "hariharanmanii15@gmail.com") {
    cookies().set('auth-token', process.env.ADMIN_AUTH_TOKEN!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })
    return { success: true }
  } else {
    return { success: false, message: 'This email is not authorized.' }
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