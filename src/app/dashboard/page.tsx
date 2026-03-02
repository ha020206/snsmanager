'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { getBrandProfiles } from '@/lib/store'
import { Map, BarChart3, MessageCircle, LogOut } from 'lucide-react'
import type { BrandProfile } from '@/types'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [brand, setBrand] = useState<BrandProfile | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getBrandProfiles(user.uid).then((list) => setBrand(list[0] ?? null))
  }, [user])

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    router.replace('/login')
  }

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-ig-background">
        <div className="animate-pulse text-ig-text-secondary">로딩 중...</div>
      </div>
    )
  }

  const cards = [
    { href: '/dashboard/roadmap', label: '콘텐츠 로드맵', desc: '게시물 주제·이미지 생성', icon: Map },
    { href: '/dashboard/insights', label: '인사이트', desc: '시간대·인기 분석', icon: BarChart3 },
    { href: '/dashboard/cs', label: 'CS 자동화', desc: '자동 답변 규칙', icon: MessageCircle },
  ]

  return (
    <div className="pb-4">
      {/* 상단 바 - 인스타그램 스타일 */}
      <header className="sticky top-0 z-10 bg-white border-b border-ig-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ig-secondary tracking-tight">SNS 도우미</h1>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="p-1.5 text-ig-text-secondary hover:text-ig-secondary"
          aria-label="로그아웃"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* 프로필 섹션 - 인스타그램 피드 상단 느낌 */}
      <section className="bg-white border-b border-ig-border px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {brand?.profileImageUrl ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-ig-border">
                <Image src={brand.profileImageUrl} alt="" width={80} height={80} className="object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ig-primary to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {(brand?.accountId || user.email || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ig-secondary truncate">{brand?.accountId || '브랜드'}</p>
            <p className="text-sm text-ig-text-secondary truncate">{user.email}</p>
            <Link
              href="/dashboard/brand"
              className="inline-block mt-2 px-4 py-1.5 rounded-lg bg-ig-background text-ig-secondary text-sm font-medium border border-ig-border"
            >
              프로필 편집
            </Link>
          </div>
        </div>
        {brand?.bio && (
          <p className="mt-3 text-sm text-ig-secondary leading-relaxed line-clamp-2">{brand.bio}</p>
        )}
      </section>

      {/* 메뉴 그리드 - 인스타그램 탭 느낌 */}
      <section className="mt-4 px-4">
        <div className="ig-card divide-y divide-ig-border">
          {cards.map(({ href, label, desc, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="card-touch flex items-center gap-4 p-4 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="w-10 h-10 rounded-full bg-ig-background flex items-center justify-center">
                <Icon className="w-5 h-5 text-ig-secondary" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ig-secondary">{label}</p>
                <p className="text-sm text-ig-text-secondary">{desc}</p>
              </div>
              <span className="text-ig-text-secondary">›</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
