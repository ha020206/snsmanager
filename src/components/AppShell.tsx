'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusSquare, BarChart3, User } from 'lucide-react'

const nav = [
  { href: '/dashboard', label: '홈', icon: Home },
  { href: '/dashboard/roadmap', label: '로드맵', icon: PlusSquare },
  { href: '/dashboard/insights', label: '인사이트', icon: BarChart3 },
  { href: '/dashboard/cs', label: 'CS', icon: Search },
  { href: '/dashboard/brand', label: '프로필', icon: User },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col min-h-dvh max-w-lg mx-auto bg-white">
      <main className="flex-1 app-scroll pb-16 bg-ig-background">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto nav-safe bg-white border-t border-ig-border z-50">
        <div className="flex justify-around items-center h-14">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 transition-colors ${
                  active ? 'text-ig-secondary' : 'text-neutral-400'
                }`}
                aria-label={label}
              >
                <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[10px]">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
