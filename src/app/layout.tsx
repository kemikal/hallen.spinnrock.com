import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rum för rörelse i Väveriet',
  description: 'Vi undersöker möjligheten att skapa ett gemensamt rum för rörelse i Väveriet. Fyll i formuläret och hjälp oss förstå intresset.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="bg-stone-50 min-h-screen">{children}</body>
    </html>
  )
}
