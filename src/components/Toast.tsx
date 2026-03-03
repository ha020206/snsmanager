'use client'

import { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

type ToastProps = {
  message: string
  visible: boolean
  onClose: () => void
}

export function Toast({ message, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg bg-[#262626] text-white text-sm font-medium shadow-lg"
      role="alert"
    >
      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}
