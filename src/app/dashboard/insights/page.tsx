'use client'

import { Heart, MessageCircle } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'

const PEAK_HOURS_DATA = [
  { hour: '10시', visitors: 42 },
  { hour: '11시', visitors: 68 },
  { hour: '12시', visitors: 95 },
  { hour: '13시', visitors: 128 },
  { hour: '14시', visitors: 88 },
  { hour: '15시', visitors: 72 },
  { hour: '16시', visitors: 65 },
  { hour: '17시', visitors: 98 },
  { hour: '18시', visitors: 135 },
  { hour: '19시', visitors: 102 },
  { hour: '20시', visitors: 58 },
]

const ENGAGEMENT_TREND_DATA = [
  { date: '2/25', rate: 3.2 },
  { date: '2/26', rate: 3.5 },
  { date: '2/27', rate: 3.8 },
  { date: '2/28', rate: 4.1 },
  { date: '3/1', rate: 4.4 },
  { date: '3/2', rate: 4.7 },
  { date: '3/3', rate: 5.0 },
]

const TOP_POSTS = [
  {
    id: '1',
    title: '비 오는 날 카페 브리즈 플레이리스트',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&h=200&fit=crop',
    likes: 1242,
    comments: 89,
  },
  {
    id: '2',
    title: '신메뉴 딸기 크로플',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop',
    likes: 987,
    comments: 56,
  },
  {
    id: '3',
    title: '아침 오픈 브이로그',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=200&fit=crop',
    likes: 756,
    comments: 34,
  },
]

export default function InsightsPage() {
  return (
    <div className="p-4 pb-8">
      <p className="text-xs text-ig-text-secondary mb-4">
        도달, 반응률, 인기 게시물을 한눈에 확인하세요.
      </p>

      {/* 요약 메트릭 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="ig-card rounded-2xl p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-ig-text-secondary">도달</p>
          <p className="text-lg font-bold text-ig-secondary mt-0.5">12,840</p>
          <p className="text-[10px] text-ig-text-secondary">이번 달</p>
        </div>
        <div className="ig-card rounded-2xl p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-ig-text-secondary">프로필 방문</p>
          <p className="text-lg font-bold text-ig-secondary mt-0.5">3,210</p>
          <p className="text-[10px] text-ig-text-secondary">이번 달</p>
        </div>
        <div className="ig-card rounded-2xl p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-ig-text-secondary">웹사이트 클릭</p>
          <p className="text-lg font-bold text-ig-primary mt-0.5">428</p>
          <p className="text-[10px] text-ig-text-secondary">이번 달</p>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        <div className="ig-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-ig-secondary mb-3">
            방문자가 많은 시간대
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PEAK_HOURS_DATA} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <XAxis dataKey="hour" tick={{ fill: '#8e8e8e', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8e8e8e', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #dbdbdb',
                    borderRadius: 8,
                  }}
                  formatter={(value: number) => [value, '도달']}
                />
                <Bar dataKey="visitors" fill="#0095f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="ig-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-ig-secondary mb-3">
            최근 7일 반응률
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ENGAGEMENT_TREND_DATA} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fill: '#8e8e8e', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8e8e8e', fontSize: 10 }} domain={[0, 6]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #dbdbdb',
                    borderRadius: 8,
                  }}
                  formatter={(value: number) => [`${value}%`, '반응률']}
                />
                <Line type="monotone" dataKey="rate" stroke="#0095f6" strokeWidth={2} dot={{ fill: '#0095f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 인기 게시물 Top 3 */}
      <div className="ig-card rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-ig-border">
          <h3 className="text-sm font-semibold text-ig-secondary">이번 달 인기 게시물</h3>
        </div>
        <div className="grid grid-cols-3 gap-px bg-ig-border">
          {TOP_POSTS.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-square bg-ig-background"
            >
              <img
                src={post.thumbnailUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                <span className="flex items-center gap-1 text-white font-semibold text-sm">
                  <Heart className="w-5 h-5 fill-current" />
                  {post.likes.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-white font-semibold text-sm">
                  <MessageCircle className="w-5 h-5" />
                  {post.comments}
                </span>
              </div>
              <p className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-xs truncate">
                {post.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
