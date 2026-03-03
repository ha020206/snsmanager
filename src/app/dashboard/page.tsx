'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2, Link2, Grid3X3 } from 'lucide-react'

type HomeTab = 'profile' | 'account'

type ProfileResult = {
  accountId: string
  bio: string
  profileImageUrl: string
  posts: number
  followers: number
  following: number
}

const MOCK_PROFILES: ProfileResult[] = [
  {
    accountId: 'cafe_breeze_gw',
    bio: '강원도의 여유를 담은 공간 ☕️\n향긋한 스페셜티 커피와 수제 디저트\n📍 매일 11:00 - 21:00\n🐶 반려동물 동반 환영',
    profileImageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop',
    posts: 128,
    followers: 2840,
    following: 62,
  },
  {
    accountId: 'cafe_breeze_gw',
    bio: '강원도의 여유를 담은 공간 ☕️ | 스페셜티 커피와 수제 디저트 | 📍 11:00 - 21:00',
    profileImageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=200&fit=crop',
    posts: 96,
    followers: 1520,
    following: 48,
  },
]

const INDUSTRY_OPTIONS = ['카페', '베이커리', '식당', '소매', '기타']
const ATMOSPHERE_OPTIONS = ['감성적인', '조용한', '트렌디한', '미니멀', '가족친화적']

const MOCK_POST_GRID = [
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop',
]

export default function DashboardPage() {
  const [tab, setTab] = useState<HomeTab>('profile')
  const [industry, setIndustry] = useState('')
  const [target, setTarget] = useState('')
  const [atmosphere, setAtmosphere] = useState('')
  const [profileResult, setProfileResult] = useState<ProfileResult | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [accountLinked, setAccountLinked] = useState(false)

  const handleGenerateProfile = () => {
    setProfileLoading(true)
    setProfileResult(null)
    const idx = [industry, target, atmosphere].filter(Boolean).length % MOCK_PROFILES.length
    setTimeout(() => {
      setProfileResult(MOCK_PROFILES[idx] ?? MOCK_PROFILES[0])
      setProfileLoading(false)
    }, 1400)
  }

  const handleLinkAccount = () => {
    setAccountLinked(true)
    setProfileResult(MOCK_PROFILES[0])
  }

  const displayProfile = profileResult || (accountLinked ? MOCK_PROFILES[0] : null)
  const showProfile = !!displayProfile

  return (
    <div className="py-5 flex-1 flex flex-col min-h-0">
      {!showProfile && (
        <div className="flex rounded-xl bg-ig-background p-1 mb-5">
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${tab === 'profile' ? 'bg-white text-ig-secondary shadow-sm' : 'text-ig-text-secondary'}`}
          >
            프로필 제작
          </button>
          <button
            type="button"
            onClick={() => setTab('account')}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${tab === 'account' ? 'bg-white text-ig-secondary shadow-sm' : 'text-ig-text-secondary'}`}
          >
            기존 계정
          </button>
        </div>
      )}

      {!showProfile && tab === 'profile' && (
        <div className="ig-card p-5 rounded-xl">
          <p className="text-sm text-ig-text-secondary mb-4">업종·타겟·분위기를 입력하면 AI가 계정 ID, 소개글, 프로필 이미지를 만들어요.</p>
          <div className="space-y-3">
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-ig-background border border-ig-border text-ig-secondary text-sm">
              <option value="">업종 선택</option>
              {INDUSTRY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <input type="text" placeholder="타겟 고객 (예: 대학생, 관광객)" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-ig-background border border-ig-border text-ig-secondary text-sm placeholder-ig-text-secondary" />
            <select value={atmosphere} onChange={(e) => setAtmosphere(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-ig-background border border-ig-border text-ig-secondary text-sm">
              <option value="">매장 분위기</option>
              {ATMOSPHERE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <button onClick={handleGenerateProfile} disabled={profileLoading} className="btn-primary w-full py-3 disabled:opacity-60">
              {profileLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> 생성 중</> : 'AI로 프로필 만들기'}
            </button>
          </div>
        </div>
      )}

      {!showProfile && tab === 'account' && (
        <div>
          {!accountLinked ? (
            <div className="ig-card p-8 rounded-xl text-center">
              <Link2 className="w-12 h-12 text-ig-primary mx-auto mb-4" />
              <p className="text-base font-medium text-ig-secondary mb-1">인스타그램 계정 연동</p>
              <p className="text-sm text-ig-text-secondary mb-5">연동하면 올린 게시글을 불러와 분석할 수 있어요.</p>
              <button type="button" onClick={handleLinkAccount} className="btn-primary w-full py-3">
                계정 불러오기
              </button>
            </div>
          ) : null}
        </div>
      )}

      {showProfile && displayProfile && (
        <div className="flex-1 flex flex-col min-h-0 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 py-5">
            <div className="flex justify-center sm:justify-start">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-ig-border flex-shrink-0">
                <Image src={displayProfile.profileImageUrl} alt="" width={112} height={112} className="object-cover w-full h-full" unoptimized />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h2 className="text-xl font-normal text-ig-secondary">{displayProfile.accountId}</h2>
                <button type="button" className="btn-outline py-1.5 px-4 text-sm">
                  프로필 편집
                </button>
              </div>
              <ul className="flex gap-6 mb-4">
                <li><span className="font-semibold text-ig-secondary">{displayProfile.posts}</span><span className="text-ig-secondary ml-1">게시물</span></li>
                <li><span className="font-semibold text-ig-secondary">{displayProfile.followers.toLocaleString()}</span><span className="text-ig-secondary ml-1">팔로워</span></li>
                <li><span className="font-semibold text-ig-secondary">{displayProfile.following}</span><span className="text-ig-secondary ml-1">팔로잉</span></li>
              </ul>
              <p className="text-sm text-ig-secondary font-semibold break-words">{displayProfile.accountId.replace('_', ' ')}</p>
              <p className="text-sm text-ig-secondary whitespace-pre-line mt-1">{displayProfile.bio}</p>
            </div>
          </div>

          <div className="border-t border-ig-border mt-4">
            <div className="flex justify-center border-b border-ig-border">
              <button type="button" className="flex items-center gap-2 py-3 px-6 text-ig-secondary border-b-2 border-ig-secondary -mb-px">
                <Grid3X3 className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-xs font-medium">게시물</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-px bg-ig-border">
              {MOCK_POST_GRID.map((src, i) => (
                <div key={i} className="aspect-square bg-ig-background relative">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
