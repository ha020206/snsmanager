'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#fafafa]">
      <div className="animate-pulse text-[#8e8e8e] text-sm">이동 중...</div>
    </div>
  )
}
