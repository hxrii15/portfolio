'use server'

import { portfolioAssistant } from '@/ai/flows/portfolio-assistant'
import { cookies } from 'next/headers'
import { z } from 'zod'

const loginSchema = z.object({
  password: z.string(),
})

export async function login(data: unknown) {
  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, message: 'Invalid data' }
  }

  if (parsed.data.password === process.env.ADMIN_PASSWORD) {
    cookies().set('auth-token', process.env.ADMIN_AUTH_TOKEN!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })
    return { success: true }
  } else {
    return { success: false, message: 'Incorrect password' }
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
