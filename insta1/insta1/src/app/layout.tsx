// src/app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import { SupabaseProvider } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

// ✅ KEIN 'use client' → damit metadata erlaubt ist
export const metadata = {
  title: 'Shadow',
  description: 'A modern social media platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}