
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const mainNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/#about', label: 'About' },
  { href: '/#education', label: 'Education' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/poems', label: 'Poems' },
]

const sectionNavLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#education', label: 'Education' },
  { href: '#projects', label: 'Projects' },
  { href: '#blog', label: 'Blog' },
  { href: '#poem', label: 'Poems' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState('/')
  const pathname = usePathname()

  const navLinks = pathname === '/' ? sectionNavLinks : mainNavLinks.map(link => {
    // If on a subpage, internal links should point to the homepage sections
    if (link.href.includes('/#')) {
        return { ...link, href: `/${link.href}` };
    }
    return link;
  });


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      if (pathname === '/') {
        const sections = sectionNavLinks.map(link => document.getElementById(link.href.substring(1))).filter(Boolean);
        
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
      } else {
        setActiveLink(pathname);
      }
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  const NavContent = ({ isMobile = false }) => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => {
            if (!pathname.startsWith(link.href)) setActiveLink(link.href)
          }}
          className={cn(
            'transition-colors hover:text-primary',
            (pathname === '/' && activeLink === link.href) || (pathname.startsWith(link.href) && link.href !== '/')
            ? 'text-primary font-bold'
            : 'text-muted-foreground',
            isMobile && 'block py-2 text-lg'
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  )

  return (
    <header className={cn('sticky top-0 z-50 w-full transition-all duration-300', isScrolled ? 'border-b bg-background/80 backdrop-blur-sm' : 'bg-background')}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setActiveLink('/')}>
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
