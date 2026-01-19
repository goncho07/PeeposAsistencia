import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { TenantProvider } from './contexts/TenantContext'

export const metadata: Metadata = {
  title: 'InteliCole | Asistencia',
  description: 'Sistema de control de asistencia escolar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const themeScript = `
    (function() {
      const theme = localStorage.getItem('theme') ||
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
    })()
  `;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            <TenantProvider>
              {children}
            </TenantProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}