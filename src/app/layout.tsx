import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import './globals.css'
import 'bs-icon/icons.css'

import { ThemeProvider } from '@/components/layout'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Home page '
}

export default async function MainLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Next.js starter</title>
        <meta name='description' content='A Starter with Next.js' />
      </head>

      <body className={GeistSans.className} suppressHydrationWarning>
        <ThemeProvider attribute='class'>
          <div className='overflow-x-auto overflow-y-hidden'>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
