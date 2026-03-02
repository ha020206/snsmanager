'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { saveBrandProfile } from '@/lib/store'
import { ChevronLeft } from 'lucide-react'

type Step = 'auth' | 'brand'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [industry, setIndustry] = useState('')
  const [target, setTarget] = useState('')
  const [atmosphere, setAtmosphere] = useState('')
  const [keywords, setKeywords] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        setStep('brand')
        setLoading(false)
        return
      }
      await signIn(email, password)
      router.replace('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 실패')
    } finally {
      setLoading(false)
    }
  }

  const submitSignupWithBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const kw = keywords.split(/[\s,]+/).filter(Boolean)
      let accountId = `brand_${Date.now().toString(36)}`
      let bio = `✨ ${[industry, target, atmosphere, ...kw].filter(Boolean).join(' ')}\n문의 환영합니다.`
      let profileImageUrl: string | null = null

      if (kw.length > 0 || industry || target || atmosphere) {
        const res = await fetch('/api/brand/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keywords: kw.length ? kw : ['브랜드'],
            industry: industry || undefined,
            targetCustomer: target || undefined,
            atmosphere: atmosphere || undefined,
          }),
        })
        const data = await res.json()
        if (res.ok && data.accountId) {
          accountId = data.accountId
          bio = data.bio
          profileImageUrl = data.profileImageUrl ?? null
        }
      }

      await signUp(email, password)
      await saveBrandProfile('local', {
        keywords: kw.length ? kw : ['브랜드'],
        accountId,
        bio,
        profileImageUrl,
        industry: industry || undefined,
        targetCustomer: target || undefined,
        atmosphere: atmosphere || undefined,
      })
      router.replace('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : '가입 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-sm mx-auto w-full">
        {step === 'brand' && (
          <button
            type="button"
            onClick={() => setStep('auth')}
            className="absolute top-4 left-4 p-2 -ml-2 text-neutral-600"
            aria-label="뒤로"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {step === 'auth' ? (
          <>
            <h1 className="text-3xl font-bold text-center text-neutral-900 mb-2 tracking-tight">
              SNS 도우미
            </h1>
            <p className="text-neutral-500 text-sm text-center mb-8">
              맞춤형 브랜딩과 콘텐츠를 한 곳에서
            </p>
            <form onSubmit={submitAuth} className="space-y-3">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400"
                required
              />
              <input
                type="password"
                placeholder="비밀번호 (6자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400"
                required
                minLength={6}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#0095f6] text-white text-sm font-semibold hover:bg-[#1877f2] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '처리 중...' : isSignUp ? '다음' : '로그인'}
              </button>
            </form>
            <button
              type="button"
              onClick={() => setIsSignUp((v) => !v)}
              className="w-full mt-6 text-neutral-500 text-sm"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-neutral-900 mb-1">브랜드 프로필</h2>
            <p className="text-neutral-500 text-sm mb-6">
              업종·타겟을 알려주시면 AI가 계정 ID와 소개글을 만들어드려요.
            </p>
            <form onSubmit={submitSignupWithBrand} className="space-y-3">
              <input
                type="text"
                placeholder="업종 (예: 카페, 패션)"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
              <input
                type="text"
                placeholder="타겟 고객 (예: 20대 여성)"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
              <input
                type="text"
                placeholder="매장 분위기 (예: 감성, 미니멀)"
                value={atmosphere}
                onChange={(e) => setAtmosphere(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
              <input
                type="text"
                placeholder="키워드 (쉼표 또는 공백 구분)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#0095f6] text-white text-sm font-semibold hover:bg-[#1877f2] disabled:opacity-50"
              >
                {loading ? '가입 중...' : '가입 완료'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
