import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import './globals.css'
import 'bs-icon/icons.css'

import { ThemeProvider } from '@/components/layout'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Home page '
}

export default async function MainLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>h5-构建工具</title>
        <meta name='description' content='A Starter with Next.js' />
      </head>

      <body className={GeistSans.className} suppressHydrationWarning>
        <ThemeProvider attribute='class'>
          <div className='overflow-x-auto overflow-y-hidden'>
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
