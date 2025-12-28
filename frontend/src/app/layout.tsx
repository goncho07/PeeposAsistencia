import './globals.css'
import type { Metadata } from 'next'
import { ThemeScript } from './components/ThemeScript'
import { ThemeProvider } from './contexts/ThemeContext'
import { TenantProvider } from './contexts/TenantProvider'

export const metadata: Metadata = {
  title: 'Peepos | Asistencia',
  description: 'Sistema de control de asistencia escolar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <ThemeScript />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <TenantProvider>
            {children}
          </TenantProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}