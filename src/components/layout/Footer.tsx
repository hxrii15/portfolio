import { Button } from '@/components/ui/button'
import { Github, Linkedin, Instagram } from 'lucide-react'
import Link from 'next/link'
import { ContactModal } from '@/components/ContactModal'

export default function Footer() {
  return (
    <footer className="bg-background text-secondary-foreground border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row md:px-6">
        <div className="flex-1 text-center md:text-left order-3 md:order-1">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Hariharan. All rights reserved.</p>
        </div>
        
        <div className="flex-1 flex justify-center order-1 md:order-2">
          <ContactModal />
        </div>

        <div className="flex-1 flex items-center justify-center md:justify-end gap-2 order-2 md:order-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://instagram.com/magical_simper" target="_blank" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://github.com" target="_blank" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://linkedin.com" target="_blank" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  )
}
