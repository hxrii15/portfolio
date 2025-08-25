'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Briefcase, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#education', label: 'Education' },
  { href: '#projects', label: 'Projects' },
  { href: '#blog', label: 'Blog' },
  { href: '#poem', label: 'Poems' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState('#home')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      const sections = navLinks.map(link => document.getElementById(link.href.substring(1))).filter(Boolean);
      
      let currentSection = '#home';
      sections.forEach(section => {
        if (section) {
          const sectionTop = section.offsetTop - 100;
          if (window.scrollY >= sectionTop) {
            currentSection = `#${section.id}`;
          }
        }
      });
      setActiveLink(currentSection);
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const NavContent = ({ isMobile = false }) => (
    <>
      {navLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={cn(
            'transition-colors hover:text-primary',
            activeLink === link.href ? 'text-primary font-bold' : 'text-muted-foreground',
            isMobile && 'block py-2 text-lg'
          )}
        >
          {link.label}
        </a>
      ))}
      <Link href="/admin/login">
        <Button variant="ghost" size={isMobile ? 'lg' : 'sm'}>
          <UserCircle className="mr-2 h-4 w-4" />
          Admin
        </Button>
      </Link>
    </>
  )

  return (
    <header className={cn('sticky top-0 z-50 w-full transition-all duration-300', isScrolled ? 'border-b bg-background/80 backdrop-blur-sm' : 'bg-background')}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="#home" className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold">Hariharan</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavContent />
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="mt-8 flex flex-col gap-6">
                <NavContent isMobile />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
