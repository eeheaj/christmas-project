import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Decorate My House',
  description: 'Decorate your house with windows and receive letters from visitors!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* Snowfall effect */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="snowflake">●</div>
          ))}
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

