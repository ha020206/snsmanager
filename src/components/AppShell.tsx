'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, BarChart3, MessageCircle } from 'lucide-react'

const nav = [
  { href: '/dashboard', label: '홈', icon: Home },
  { href: '/dashboard/roadmap', label: '콘텐츠', icon: CalendarDays },
  { href: '/dashboard/insights', label: '인사이트', icon: BarChart3 },
  { href: '/dashboard/cs', label: '메시지', icon: MessageCircle },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMessage = pathname === '/dashboard/cs'

  return (
    <div className="min-h-dvh bg-ig-background flex flex-col">
      <header className="sticky top-0 z-20 h-14 flex-shrink-0">
        <div className="content-wrap h-full px-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-ig-secondary truncate">
            {pathname === '/dashboard' && '홈'}
            {pathname === '/dashboard/roadmap' && '콘텐츠'}
            {pathname === '/dashboard/insights' && '인사이트'}
            {pathname === '/dashboard/cs' && '메시지'}
          </h1>
          <nav className="hidden" />
        </div>
      </header>

      <main
        className={`flex-1 flex flex-col min-h-0 content-wrap px-4 ${isMessage ? 'overflow-hidden' : 'overflow-auto'} pb-20 md:pb-6`}
      >
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 nav-safe">
        <div className="content-wrap h-14 flex justify-around items-center bg-white border border-ig-border rounded-full shadow-sm mb-3">
          {nav.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[72px] py-2 transition-colors ${isActive ? 'text-ig-secondary' : 'text-ig-text-secondary'}`}
                aria-label={label}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[11px]">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
