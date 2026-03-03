'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BrandPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard')
  }, [router])
  return (
    <div className="p-4 flex items-center justify-center min-h-[200px] text-ig-text-secondary text-sm">
      이동 중...
    </div>
  )
}
