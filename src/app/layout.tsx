import type {Metadata} from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"

const portfolioTitle = 'Hariharan Portfolio';
const portfolioDescription = 'A personal portfolio for Hariharan, showcasing projects, skills, and experience in web development and AI.';

export const metadata: Metadata = {
  metadataBase: new URL('https://hariharan-portfolio.com'), // Replace with your actual domain
  title: {
    default: portfolioTitle,
    template: `%s | ${portfolioTitle}`,
  },
  description: portfolioDescription,
  keywords: ['Hariharan', 'Portfolio', 'Full Stack Developer', 'AI Enthusiast', 'Next.js', 'React', 'TypeScript'],
  authors: [{ name: 'Hariharan', url: 'https://hariharan-portfolio.com' }],
  creator: 'Hariharan',
  publisher: 'Hariharan',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: portfolioTitle,
    description: portfolioDescription,
    url: 'https://hariharan-portfolio.com',
    siteName: portfolioTitle,
    images: [
      {
        url: 'https://placehold.co/1200x630.png', // Replace with your OG image
        width: 1200,
        height: 630,
        alt: 'Hariharan Portfolio Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: portfolioTitle,
    description: portfolioDescription,
    creator: '@your_twitter_handle', // Replace with your Twitter handle
    images: ['https://placehold.co/1200x630.png'], // Replace with your Twitter image
  },
  icons: {
    icon: '/favicon.ico', // Make sure to have a favicon.ico in your public folder
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  manifest: '/site.webmanifest', // Create a webmanifest file for PWA capabilities
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased")}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
