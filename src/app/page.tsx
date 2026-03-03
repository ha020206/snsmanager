'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[#fafafa] px-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <h1 className="text-2xl font-semibold text-[#262626]">
          SNS 마케팅 도우미
        </h1>
        <p className="text-sm text-[#8e8e8e]">
          소규모 업체·1인 기업을 위한 맞춤형 SNS 마케팅 자동화
        </p>
        <Link
          href="/login"
          className="inline-block w-full py-3.5 px-4 rounded-xl bg-[#0095f6] text-white text-sm font-semibold text-center hover:bg-[#1877f2] transition-colors"
        >
          시작하기
        </Link>
      </div>
    </div>
  )
}
