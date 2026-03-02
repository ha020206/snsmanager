'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { getBrandProfiles, saveBrandProfile } from '@/lib/store'
import type { BrandProfile } from '@/types'
import { Settings } from 'lucide-react'

export default function BrandPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [list, setList] = useState<BrandProfile[]>([])
  const [keywords, setKeywords] = useState('')
  const [industry, setIndustry] = useState('')
  const [target, setTarget] = useState('')
  const [atmosphere, setAtmosphere] = useState('')
  const [result, setResult] = useState<{ accountId: string; bio: string; profileImageUrl: string | null } | null>(null)
  const [genLoading, setGenLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getBrandProfiles(user.uid).then(setList)
  }, [user])

  const generate = async () => {
    const kw = keywords.split(/[\s,]+/).filter(Boolean)
    if (!kw.length && !industry && !target && !atmosphere) return
    setGenLoading(true)
    setResult(null)
    try {
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
      if (!res.ok) throw new Error(data.error || '생성 실패')
      setResult({ accountId: data.accountId, bio: data.bio, profileImageUrl: data.profileImageUrl })
    } catch (e) {
      alert(e instanceof Error ? e.message : '생성 실패')
    } finally {
      setGenLoading(false)
    }
  }

  const save = async () => {
    if (!result || !user) return
    setSaveLoading(true)
    try {
      const kw = keywords.split(/[\s,]+/).filter(Boolean)
      await saveBrandProfile(user.uid, {
        keywords: kw.length ? kw : ['브랜드'],
        accountId: result.accountId,
        bio: result.bio,
        profileImageUrl: result.profileImageUrl,
        industry: industry || undefined,
        targetCustomer: target || undefined,
        atmosphere: atmosphere || undefined,
      })
      setResult(null)
      setKeywords('')
      setIndustry('')
      setTarget('')
      setAtmosphere('')
      getBrandProfiles(user.uid).then(setList)
    } catch (e) {
      alert(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setSaveLoading(false)
    }
  }

  if (loading || !user) return null

  return (
    <div className="pb-4">
      <header className="sticky top-0 z-10 bg-white border-b border-ig-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ig-secondary">프로필</h1>
        <Settings className="w-5 h-5 text-ig-secondary" />
      </header>

      <div className="p-4 space-y-6">
        {!result ? (
          <div className="ig-card p-4 space-y-4">
            <p className="text-sm text-ig-text-secondary">업종·타겟·키워드로 AI가 계정 ID, 소개글, 프로필 이미지를 만들어요.</p>
            <input
              type="text"
              placeholder="업종 (예: 카페, 패션)"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-ig-background border border-ig-border text-ig-secondary placeholder-ig-text-secondary text-sm"
            />
            <input
              type="text"
              placeholder="타겟 고객 (예: 20대 여성)"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-ig-background border border-ig-border text-ig-secondary placeholder-ig-text-secondary text-sm"
            />
            <input
              type="text"
              placeholder="매장 분위기 (예: 감성, 미니멀)"
              value={atmosphere}
              onChange={(e) => setAtmosphere(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-ig-background border border-ig-border text-ig-secondary placeholder-ig-text-secondary text-sm"
            />
            <input
              type="text"
              placeholder="키워드 (쉼표 또는 공백)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-ig-background border border-ig-border text-ig-secondary placeholder-ig-text-secondary text-sm"
            />
            <button
              onClick={generate}
              disabled={genLoading}
              className="w-full py-2.5 rounded-lg bg-ig-primary text-white text-sm font-semibold disabled:opacity-50"
            >
              {genLoading ? '생성 중...' : 'AI로 프로필 생성'}
            </button>
          </div>
        ) : (
          <div className="ig-card p-4 space-y-4">
            {result.profileImageUrl && (
              <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto bg-ig-background">
                <Image src={result.profileImageUrl} alt="프로필" width={96} height={96} className="object-cover" />
              </div>
            )}
            <div>
              <p className="text-xs text-ig-text-secondary mb-0.5">계정 ID</p>
              <p className="font-semibold text-ig-secondary font-mono">{result.accountId}</p>
            </div>
            <div>
              <p className="text-xs text-ig-text-secondary mb-0.5">소개글</p>
              <p className="text-sm text-ig-secondary whitespace-pre-wrap">{result.bio}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-2.5 rounded-lg border border-ig-border text-ig-secondary text-sm font-medium"
              >
                다시 만들기
              </button>
              <button
                onClick={save}
                disabled={saveLoading}
                className="flex-1 py-2.5 rounded-lg bg-ig-primary text-white text-sm font-semibold disabled:opacity-50"
              >
                {saveLoading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        )}

        {list.length > 0 && (
          <div>
            <p className="text-sm font-medium text-ig-secondary mb-2">저장된 프로필</p>
            <ul className="space-y-2">
              {list.map((b) => (
                <li key={b.id} className="ig-card p-4 flex items-center gap-3">
                  {b.profileImageUrl ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image src={b.profileImageUrl} alt="" width={48} height={48} className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-ig-background flex-shrink-0 flex items-center justify-center text-ig-text-secondary font-semibold">
                      {(b.accountId || '?')[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ig-secondary truncate">{b.accountId}</p>
                    <p className="text-sm text-ig-text-secondary truncate">{b.bio}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
