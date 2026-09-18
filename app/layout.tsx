import type { Metadata } from 'next'
import { AuthProvider } from './lib/appwrite/AuthContext'
import '../styles.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cycletrace.co.za'),
  title: 'CycleTrace | The bike registry that works',
  description: "CycleTrace is South Africa's bike registry for registering, searching and recovering stolen bicycles.",
  applicationName: 'CycleTrace',
  keywords: ['bike registry South Africa', 'bicycle registration', 'stolen bike database', 'bike serial number search'],
  authors: [{ name: 'CycleTrace' }],
  creator: 'CycleTrace',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'CycleTrace | The bike registry that works',
    description: "Register your bike, search before you buy, and help bring stolen bicycles home.",
    url: '/',
    siteName: 'CycleTrace',
    locale: 'en_ZA',
    type: 'website',
    images: [{ url: '/logo.svg', width: 508, height: 498, alt: 'CycleTrace bicycle fingerprint logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'CycleTrace | The bike registry that works',
    description: "South Africa's bike registry for safer cycling.",
    images: ['/logo.svg'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
