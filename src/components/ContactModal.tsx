'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db } from '@/lib/firebase'
import { ref, push, set } from 'firebase/database'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail } from 'lucide-react'

export function ContactModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      email: '',
      message: ''
    }
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // 1. Save to Firebase as a backup/log
      const messagesRef = ref(db, 'messages')
      const newMessageRef = push(messagesRef)
      await set(newMessageRef, {
        ...data,
        timestamp: Date.now()
      })

      // 2. Send Email via Web3Forms (No backend required)
      // Note: You can get your FREE Access Key at https://web3forms.com/
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "YOUR_ACCESS_KEY_HERE", // Replace with your actual key
          name: data.name,
          email: data.email,
          message: data.message,
          subject: `New Portfolio Message from ${data.name}`,
          from_name: "Portfolio Contact Form",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Message Sent!",
          description: "Thank you for reaching out. I'll get back to you soon.",
        })
        reset()
        setIsOpen(false)
      } else {
        throw new Error("Email service failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Failed to send message. Please check your internet connection or try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <Mail className="mr-2 h-5 w-5" />
          Contact Me
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send a Message</DialogTitle>
          <DialogDescription>
            Have a question or want to work together? Fill out the form below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name"> Your Name</Label>
            <Input id="name" {...register('name', { required: true })} placeholder="Your Name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email"> Your Email</Label>
            <Input id="email" type="email" {...register('email', { required: true })} placeholder="your@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message"> Your Message</Label>
            <Textarea id="message" {...register('message', { required: true })} placeholder="Your message here..." rows={4} />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
