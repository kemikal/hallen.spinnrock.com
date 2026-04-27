import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hallen – Rörelselokal på Väveriet',
  description: 'Anmäl ditt intresse för en ny rörelselokal på Väveriet i Spinnrock',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="bg-stone-50 min-h-screen">{children}</body>
    </html>
  )
}
