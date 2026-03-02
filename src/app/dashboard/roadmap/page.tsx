'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { getRoadmap, getBrandProfiles, saveRoadmapItem } from '@/lib/store'
import type { ContentRoadmapItem } from '@/types'

type RoadmapTopic = { title: string; description: string; imagePrompt?: string }

export default function RoadmapPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [brandContext, setBrandContext] = useState('')
  const [brands, setBrands] = useState<{ id: string; accountId: string }[]>([])
  const [roadmap, setRoadmap] = useState<ContentRoadmapItem[]>([])
  const [generated, setGenerated] = useState<RoadmapTopic[]>([])
  const [genLoading, setGenLoading] = useState(false)
  const [imgLoadingId, setImgLoadingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getBrandProfiles(user.uid).then((list) => setBrands(list.map((b) => ({ id: b.id, accountId: b.accountId }))))
    getRoadmap(user.uid).then(setRoadmap)
  }, [user])

  const generateRoadmap = async () => {
    setGenLoading(true)
    setGenerated([])
    try {
      const res = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandContext: brandContext || undefined, count: 8 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '생성 실패')
      setGenerated(data.roadmap || [])
    } catch (e) {
      alert(e instanceof Error ? e.message : '로드맵 생성 실패')
    } finally {
      setGenLoading(false)
    }
  }

  const generateImage = async (prompt: string, index: number) => {
    setImgLoadingId(`gen-${index}`)
    try {
      const res = await fetch('/api/roadmap/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt || `social media content image ${index + 1}` }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '이미지 생성 실패')
      if (data.url && user) {
        const item: Omit<ContentRoadmapItem, 'id' | 'userId' | 'createdAt'> = {
          order: roadmap.length + index,
          title: generated[index].title,
          description: generated[index].description,
          suggestedImagePrompt: prompt,
          generatedImageUrl: data.url,
        }
        await saveRoadmapItem(user.uid, item)
        getRoadmap(user.uid).then(setRoadmap)
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : '이미지 생성 실패')
    } finally {
      setImgLoadingId(null)
    }
  }

  const addToRoadmap = async (topic: RoadmapTopic, index: number) => {
    if (!user) return
    await saveRoadmapItem(user.uid, {
      order: roadmap.length + index,
      title: topic.title,
      description: topic.description,
      suggestedImagePrompt: topic.imagePrompt,
    })
    getRoadmap(user.uid).then(setRoadmap)
  }

  if (loading || !user) return null

  return (
    <div className="pb-4">
      <header className="sticky top-0 z-10 bg-white border-b border-ig-border px-4 py-3">
        <h1 className="text-xl font-semibold text-ig-secondary">로드맵</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="ig-card p-4 space-y-3">
          <input
            type="text"
            placeholder="브랜드 맥락 (선택, 예: 감성 카페)"
            value={brandContext}
            onChange={(e) => setBrandContext(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-ig-background border border-ig-border text-ig-secondary placeholder-ig-text-secondary text-sm"
          />
          <button
            onClick={generateRoadmap}
            disabled={genLoading}
            className="w-full py-2.5 rounded-lg bg-ig-primary text-white text-sm font-semibold disabled:opacity-50"
          >
            {genLoading ? '로드맵 생성 중...' : '로드맵 생성'}
          </button>
        </div>

        {generated.length > 0 && (
          <div>
            <p className="text-sm font-medium text-ig-secondary mb-2">추천 주제</p>
            <ul className="space-y-2">
              {generated.map((t, i) => (
                <li key={i} className="ig-card p-4">
                  <p className="font-medium text-ig-secondary">{t.title}</p>
                  <p className="text-sm text-ig-text-secondary mt-1">{t.description}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addToRoadmap(t, i)}
                      className="py-2 px-3 rounded-lg border border-ig-border text-ig-secondary text-sm font-medium"
                    >
                      추가
                    </button>
                    {t.imagePrompt && (
                      <button
                        onClick={() => generateImage(t.imagePrompt!, i)}
                        disabled={imgLoadingId === `gen-${i}`}
                        className="py-2 px-3 rounded-lg bg-ig-primary text-white text-sm font-medium disabled:opacity-50"
                      >
                        {imgLoadingId === `gen-${i}` ? '생성 중...' : '이미지'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {roadmap.length > 0 && (
          <div>
            <p className="text-sm font-medium text-ig-secondary mb-2">내 로드맵</p>
            <ul className="space-y-2">
              {roadmap.map((r, i) => (
                <li key={r.id} className="ig-card p-4 flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-ig-background flex items-center justify-center text-xs font-medium text-ig-text-secondary">
                    {i + 1}
                  </span>
                  {r.generatedImageUrl && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-ig-background">
                      <Image src={r.generatedImageUrl} alt="" width={56} height={56} className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ig-secondary">{r.title}</p>
                    <p className="text-sm text-ig-text-secondary truncate">{r.description}</p>
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
