'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (user) router.replace('/dashboard')
    else router.replace('/login')
  }, [user, loading, router])

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface-app">
      <div className="animate-pulse text-gray-500">로딩 중...</div>
    </div>
  )
}
