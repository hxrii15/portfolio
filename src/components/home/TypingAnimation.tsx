'use client'

import { useState, useEffect } from 'react'

const roles = ['Full Stack Developer', 'AI Enthusiast', 'Creative Coder']

export default function TypingAnimation() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const handleTyping = () => {
      const currentRole = roles[roleIndex]
      if (isDeleting) {
        setText(currentRole.substring(0, text.length - 1))
      } else {
        setText(currentRole.substring(0, text.length + 1))
      }

      if (!isDeleting && text === currentRole) {
        setTimeout(() => setIsDeleting(true), 2000)
      } else if (isDeleting && text === '') {
        setIsDeleting(false)
        setRoleIndex((prev) => (prev + 1) % roles.length)
      }
    }

    const typingSpeed = isDeleting ? 100 : 150
    const timer = setTimeout(handleTyping, typingSpeed)

    return () => clearTimeout(timer)
  }, [text, isDeleting, roleIndex])

  return (
    <span>
      {text}
      <span className="animate-ping">|</span>
    </span>
  )
}
