import { AuthProvider, Navbar, ThemeProvider } from '@/components/layout'

import { AtomicState } from 'atomic-utils'
import { FetchConfig } from 'atomic-utils'
import { getServerSession } from 'next-auth'
import { getUserPreferences } from '@/lib/preferences'
import { cookies } from 'next/headers'
import { checkDatabaseConnection } from '@/lib/prisma'


export default async function MainLayout({ children }) {
  const session = await getServerSession()

  const preferences = await getUserPreferences()

  const serverTheme = (await cookies()).get('theme')?.value ?? 'system'

  await checkDatabaseConnection()

  return (
    <main className='min-h-screen'>
      <AuthProvider>
        <AtomicState
          value={{
            'server-theme': serverTheme
          }}
        >
          <FetchConfig
            baseUrl='/api'
            value={{
              User: session ?? {},
              Preferences: preferences ?? {}
            }}
          >
            <Navbar />
            <div className='overflow-x-auto'>
              {children}
            </div>
          </FetchConfig>
        </AtomicState>
      </AuthProvider>
    </main>
  )
}
