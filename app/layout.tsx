import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SessionProvider } from '@/lib/session-store'
import './globals.css'

const siteUrl = 'https://www.pyeater.in'
const siteTitle = 'IGNOU Coders | Video Classes, Study Notes & Learning'
const siteDescription =
  'Learn with IGNOU Coders: watch recorded coding classes, explore study notes, and grow with a supportive student community.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: 'IGNOU Coders',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'IGNOU Coders',
    title: siteTitle,
    description: siteDescription,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary',
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
  themeColor: '#f6f8fb',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
