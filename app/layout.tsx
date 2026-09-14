import type { Metadata } from 'next'
import '../styles.css'

export const metadata: Metadata = {
  title: 'CycleTrace | The bike registry that works',
  description: "South Africa's bicycle registry for registering, searching and recovering bikes.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
