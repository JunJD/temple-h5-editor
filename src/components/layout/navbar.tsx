'use client'
import Link from 'next/link'

import { ThemeToggle, AuthButton } from '@/components/layout'


import { usePathname } from 'next/navigation'
import { cn, RenderList } from 'atomic-utils'

const NAVBAR_LINKS: {
  children: string
  href: string
  target?: string
  rel?: string
}[] = [
  {
    children: '应用',
    href: '/client/issues'
  }
]

const useGetLinksStyle = () => {
  const pathname = usePathname()
  return function getLinkStyles(href: string) {
    return cn('text-sm text-foreground/70 hover:text-foreground', {
      'text-blue-700 dark:text-blue-400 font-medium hover:text-blue-700':
        pathname.startsWith(href)
    })
  }
}

function AuthAndTheme() {
  return (
    <div className='flex items-center gap-x-2'>
      <ThemeToggle />
      <AuthButton />
    </div>
  )
}

function DesktopMenu() {
  const getLinkStyle = useGetLinksStyle()
  return (
    <>
      <div className='space-x-3 hidden md:inline-block'>
        <Link className='font-bold w-16 h-auto' href={'/'}>
          H5-Builder
        </Link>
        <RenderList
          data={NAVBAR_LINKS}
          render={link => (
            <Link
              key={'desktop' + link.href}
              className={getLinkStyle(link.href)}
              {...link}
            />
          )}
        />
      </div>
      <AuthAndTheme />
    </>
  )
}

export default function Navbar() {
  // 根据当前路径，判断是否显示菜单
  const pathname = usePathname()
  const isNotVisible = pathname.endsWith('/edit')
  if (isNotVisible) {
    return null
  }
  return (
    <header className='border-b border-neutral-100 dark:border-inherit  sticky top-0 z-50 h-14 items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='mx-auto flex items-center h-full justify-between py-2 px-6 md:px-8'>
        <DesktopMenu />
      </div>
    </header>
  )
}
