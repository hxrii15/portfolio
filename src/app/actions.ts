'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { portfolioAssistant } from '@/ai/flows/portfolio-assistant'

const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
})

export async function signInWithEmail(data: unknown) {
  const parsed = emailLoginSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, message: 'Invalid data' }
  }

  // In a real app, you would use Firebase Admin SDK here to verify the user
  // For this prototype, we will simulate the check
  if (parsed.data.email === "hariharanmanii15@gmail.com" && parsed.data.password === process.env.ADMIN_PASSWORD) {
     cookies().set('auth-token', process.env.ADMIN_AUTH_TOKEN!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })
    return { success: true }
  } else {
    return { success: false, message: 'Invalid email or password.' }
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
