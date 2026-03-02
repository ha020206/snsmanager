'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { getInsights, getInsightPosts } from '@/lib/store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'
import { ko } from 'date-fns/locale'

type InsightMetric = { date: string; views: number; likes: number; comments: number; bestHour: number }
type PostRow = { id: string; title: string; type: string; publishedAt: number; views: number; likes: number; comments: number }

export default function InsightsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [metrics, setMetrics] = useState<InsightMetric[]>([])
  const [posts, setPosts] = useState<PostRow[]>([])
  const [days, setDays] = useState(14)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getInsights(user.uid, days).then(setMetrics)
    getInsightPosts(user.uid).then(setPosts)
  }, [user, days])

  const chartData = metrics.length > 0
    ? [...metrics].reverse().map((m) => ({ ...m, name: m.date.slice(5) }))
    : Array.from({ length: 14 }, (_, i) => {
        const d = subDays(new Date(), 13 - i)
        return {
          date: format(d, 'yyyy-MM-dd'),
          name: format(d, 'M/d', { locale: ko }),
          views: 100 + Math.floor(Math.random() * 200),
          likes: 10 + Math.floor(Math.random() * 30),
          comments: Math.floor(Math.random() * 10),
          bestHour: 12 + (i % 6),
        }
      })

  const bestHourCount: Record<number, number> = {}
  chartData.forEach((d) => {
    const h = (d as InsightMetric & { bestHour?: number }).bestHour ?? 12
    bestHourCount[h] = (bestHourCount[h] || 0) + 1
  })
  const bestHour = Object.entries(bestHourCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '12'

  if (loading || !user) return null

  return (
    <div className="pb-4">
      <header className="sticky top-0 z-10 bg-white border-b border-ig-border px-4 py-3">
        <h1 className="text-xl font-semibold text-ig-secondary">인사이트</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="ig-card p-4">
          <p className="text-xs text-ig-text-secondary mb-0.5">추천 게시 시간대</p>
          <p className="text-2xl font-bold text-ig-primary">{bestHour}시</p>
          <p className="text-xs text-ig-text-secondary mt-1">반응이 좋은 시간대예요.</p>
        </div>

        <div className="ig-card p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-ig-secondary">일별 참여</p>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-ig-background border border-ig-border rounded-lg px-2 py-1 text-ig-secondary text-sm"
            >
              <option value={7}>7일</option>
              <option value={14}>14일</option>
              <option value={30}>30일</option>
            </select>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#8e8e8e', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8e8e8e', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #dbdbdb', borderRadius: 8 }}
                  labelStyle={{ color: '#262626' }}
                  formatter={(value: number) => [value, '']}
                  labelFormatter={(label) => `날짜: ${label}`}
                />
                <Bar dataKey="views" name="조회" fill="#0095f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="likes" name="좋아요" fill="#ed4956" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ig-card p-4">
          <p className="text-sm font-medium text-ig-secondary mb-2">인기 게시물</p>
          {posts.length === 0 ? (
            <p className="text-ig-text-secondary text-sm">연동된 게시물이 없어요.</p>
          ) : (
            <ul className="space-y-2">
              {posts.slice(0, 5).map((p) => (
                <li key={p.id} className="flex justify-between items-center py-2 border-b border-ig-border last:border-0">
                  <span className="text-ig-secondary text-sm truncate flex-1">{p.title}</span>
                  <span className="text-ig-text-secondary text-xs ml-2">❤ {p.likes}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
