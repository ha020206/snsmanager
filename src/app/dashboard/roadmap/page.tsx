'use client'

import { useState, useRef } from 'react'
import {
  Upload,
  Film,
  Sparkles,
  Loader2,
  ImagePlus,
  Music,
  Image as ImageIcon,
  CalendarClock,
  Play,
  Hash,
} from 'lucide-react'
import { Toast } from '@/components/Toast'
import { Modal } from '@/components/Modal'

const RECOMMENDED_PEAK_HOUR = '18' // 인사이트 '방문자 많은 시간대' 기준 추천
const RECOMMENDED_TOPICS = [
  { id: '1', title: '비 오는 날 감성 릴스', hint: '이번 달 인기 주제', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop', caption: '비 오는 날엔 커피 한 잔이 최고죠 ☕️ 강원도 카페 브리즈.', hashtags: ['#강원도카페', '#감성카페', '#비오는날'] },
  { id: '2', title: '신메뉴 딸기 크로플', hint: '이번 달 인기 주제', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop', caption: '🍓 이번 주말 한정! 수제 크로플. 선착순 20인.', hashtags: ['#딸기크로플', '#주말한정', '#강원도카페'] },
  { id: '3', title: '오픈 브이로그', hint: '11시 오픈 준비', imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop', caption: '오픈 전 준비하는 카페 브리즈 🌅 매일 11시.', hashtags: ['#카페브이로그', '#오픈준비', '#강원도카페'] },
  { id: '4', title: '반려동물 동반 TIP', hint: '야외 테라스', imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop', caption: '🐶 반려동물과 함께 오세요! 야외 테라스·물 대기.', hashtags: ['#반려동물동반', '#펫프렌들리카페'] },
]

const CUSTOM_IMAGES: Record<string, string> = {
  커피: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop',
  카페: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop',
  디저트: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
  브런치: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
  기본: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
}

type Tab = 'idea' | 'photo' | 'schedule'
type ScheduleItem = { id: string; title: string; kind: 'reels' | 'feed'; at: string }

function getRecommendedHourLabel() {
  return `${RECOMMENDED_PEAK_HOUR}시`
}

function formatScheduleAt(date: string, time: string) {
  if (!date || !time) return `오늘 ${getRecommendedHourLabel()}`
  const d = new Date(date)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}/${day} ${time}`
}

export default function RoadmapPage() {
  const [tab, setTab] = useState<Tab>('idea')
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [modalTopic, setModalTopic] = useState<typeof RECOMMENDED_TOPICS[0] | null>(null)
  const [modalCaption, setModalCaption] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoMode, setPhotoMode] = useState<'reels' | 'feed' | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoResult, setPhotoResult] = useState<{ caption?: string; musicLabel?: string; isReelsVideo?: boolean } | null>(null)
  const [captionText, setCaptionText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [customKeyword, setCustomKeyword] = useState('')
  const [customLoading, setCustomLoading] = useState(false)
  const [customResult, setCustomResult] = useState<{ imageUrl: string; caption: string } | null>(null)
  const [customCaption, setCustomCaption] = useState('')

  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>([])
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduleTarget, setScheduleTarget] = useState<{ title: string; kind: 'reels' | 'feed' } | null>(null)
  const [scheduleSource, setScheduleSource] = useState<'modal' | 'photo' | 'custom'>('modal')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState(RECOMMENDED_PEAK_HOUR + ':00')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setToastVisible(true)
  }

  const applyRecommendedTime = () => {
    setScheduleTime(RECOMMENDED_PEAK_HOUR + ':00')
  }

  const handleTopicGenerate = (topic: typeof RECOMMENDED_TOPICS[0]) => {
    setLoadingId(topic.id)
    setTimeout(() => {
      setLoadingId(null)
      setModalTopic(topic)
      setModalCaption(topic.caption + ' ' + topic.hashtags.join(' '))
    }, 1200)
  }

  const handleUploadFromModal = () => {
    if (!modalCaption.trim()) {
      showToast('캡션을 입력해 주세요.')
      return
    }
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      setModalTopic(null)
      showToast('인스타그램에 업로드 완료되었습니다.')
    }, 1800)
  }

  const openScheduleFromModal = () => {
    setScheduleTarget(modalTopic ? { title: modalTopic.title, kind: modalTopic.title.includes('릴스') ? 'reels' : 'feed' } : null)
    setScheduleSource('modal')
    setScheduleModalOpen(true)
    const today = new Date().toISOString().slice(0, 10)
    setScheduleDate(today)
    setScheduleTime(RECOMMENDED_PEAK_HOUR + ':00')
  }

  const handleScheduleSubmit = () => {
    if (!scheduleTarget) return
    const at = formatScheduleAt(scheduleDate || new Date().toISOString().slice(0, 10), scheduleTime || RECOMMENDED_PEAK_HOUR + ':00')
    setScheduleList((prev) => [...prev, { id: Date.now().toString(), title: scheduleTarget.title, kind: scheduleTarget.kind, at }])
    setScheduleModalOpen(false)
    setScheduleTarget(null)
    setModalTopic(null)
    showToast(`${at}에 예약되었습니다.`)
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoMode(null)
    setPhotoResult(null)
    setCaptionText('')
  }

  const handlePhotoAsReels = () => {
    if (!photoPreview) return
    setPhotoMode('reels')
    setPhotoLoading(true)
    setPhotoResult(null)
    setTimeout(() => {
      setPhotoLoading(false)
      const caption = '오늘 분위기를 짧게 담은 릴스 영상이에요 ☕️ 강원도 카페 브리즈에서 만나요. #강원도카페 #카페브리즈 #릴스'
      setPhotoResult({ musicLabel: '추가된 BGM: Lo-fi Coffee Vibes', caption, isReelsVideo: true })
      setCaptionText(caption)
    }, 2200)
  }

  const handlePhotoAsFeed = () => {
    if (!photoPreview) return
    setPhotoMode('feed')
    setPhotoLoading(true)
    setPhotoResult(null)
    setTimeout(() => {
      setPhotoLoading(false)
      const caption = '오늘도 좋은 하루 되세요 ☕️ 카페 브리즈에서 만나요. #강원도카페 #카페브리즈'
      setPhotoResult({ caption })
      setCaptionText(caption)
    }, 1200)
  }

  const resetPhoto = () => {
    setPhotoPreview(null)
    setPhotoMode(null)
    setPhotoResult(null)
    setCaptionText('')
  }

  const handleInstagramUploadFromPhoto = () => {
    if (!captionText.trim()) {
      showToast('캡션을 입력해 주세요.')
      return
    }
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      showToast('인스타그램에 업로드 완료되었습니다.')
    }, 1800)
  }

  const openScheduleFromPhoto = () => {
    setScheduleTarget({
      title: photoMode === 'reels' ? '릴스 영상' : '피드 게시글',
      kind: photoMode === 'reels' ? 'reels' : 'feed',
    })
    setScheduleSource('photo')
    setScheduleModalOpen(true)
    setScheduleDate(new Date().toISOString().slice(0, 10))
    setScheduleTime(RECOMMENDED_PEAK_HOUR + ':00')
  }

  const handleScheduleFromPhoto = () => {
    if (!scheduleTarget) return
    const at = formatScheduleAt(scheduleDate, scheduleTime)
    setScheduleList((prev) => [...prev, { id: Date.now().toString(), title: scheduleTarget.title, kind: scheduleTarget.kind, at }])
    setScheduleModalOpen(false)
    setScheduleTarget(null)
    showToast(`${at}에 예약되었습니다.`)
  }

  const handleCustomGenerate = () => {
    if (!customKeyword.trim()) {
      showToast('키워드를 입력해 주세요.')
      return
    }
    setCustomLoading(true)
    setCustomResult(null)
    const imgKey = Object.keys(CUSTOM_IMAGES).find((k) => customKeyword.includes(k)) || '기본'
    const imageUrl = CUSTOM_IMAGES[imgKey]
    setTimeout(() => {
      setCustomLoading(false)
      const caption = `${customKeyword} 콘텐츠예요. 카페 브리즈에서 만나요 ☕️ #${customKeyword.replace(/\s/g, '')} #강원도카페 #카페브리즈`
      setCustomResult({ imageUrl, caption })
      setCustomCaption(caption)
    }, 1600)
  }

  const handleUploadFromCustom = () => {
    if (!customCaption.trim()) {
      showToast('캡션을 입력해 주세요.')
      return
    }
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      showToast('인스타그램에 업로드 완료되었습니다.')
    }, 1800)
  }

  const openScheduleFromCustom = () => {
    setScheduleTarget({ title: customKeyword || '나만의 주제', kind: 'feed' })
    setScheduleSource('custom')
    setScheduleModalOpen(true)
    setScheduleDate(new Date().toISOString().slice(0, 10))
    setScheduleTime(RECOMMENDED_PEAK_HOUR + ':00')
  }

  const handleScheduleFromCustom = () => {
    if (!scheduleTarget) return
    const at = formatScheduleAt(scheduleDate, scheduleTime)
    setScheduleList((prev) => [...prev, { id: Date.now().toString(), title: scheduleTarget.title, kind: scheduleTarget.kind, at }])
    setScheduleModalOpen(false)
    setScheduleTarget(null)
    showToast(`${at}에 예약되었습니다.`)
  }

  const recommendedHourLabel = getRecommendedHourLabel()

  return (
    <div className="py-5 pb-8">
      <div className="flex rounded-xl bg-ig-background p-1 mb-5">
        <button
          type="button"
          onClick={() => setTab('idea')}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${tab === 'idea' ? 'bg-white text-ig-secondary shadow-sm' : 'text-ig-text-secondary'}`}
        >
          아이디어
        </button>
        <button
          type="button"
          onClick={() => setTab('photo')}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${tab === 'photo' ? 'bg-white text-ig-secondary shadow-sm' : 'text-ig-text-secondary'}`}
        >
          사진 업로드
        </button>
        <button
          type="button"
          onClick={() => setTab('schedule')}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${tab === 'schedule' ? 'bg-white text-ig-secondary shadow-sm' : 'text-ig-text-secondary'}`}
        >
          예약 업로드
        </button>
      </div>

      {tab === 'idea' && (
        <div className="space-y-5 mb-6">
          <div className="space-y-3">
            <p className="text-sm text-ig-text-secondary mb-1">
              이번 달 인기 게시물을 반영한 추천 주제예요. 생성 후 수정·업로드·예약할 수 있어요.
            </p>
            {RECOMMENDED_TOPICS.map((topic) => (
              <div key={topic.id} className="ig-card p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-ig-background flex-shrink-0">
                    <img src={topic.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ig-secondary text-sm truncate">{topic.title}</p>
                    <p className="text-xs text-ig-text-secondary truncate">{topic.hint}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTopicGenerate(topic)}
                  disabled={loadingId === topic.id}
                  className="btn-primary min-w-[72px] py-2 disabled:opacity-60"
                >
                  {loadingId === topic.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>생성</span>
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <p className="text-sm text-ig-text-secondary">나만의 주제를 입력하면 AI가 이미지와 캡션을 만들어 줍니다.</p>
            <div className="ig-card p-4 rounded-xl">
              <label className="block text-xs font-medium text-ig-text-secondary mb-2">키워드</label>
              <input
                type="text"
                placeholder="예: 커피, 신메뉴, 이벤트"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-ig-background border border-ig-border text-ig-secondary text-sm placeholder-ig-text-secondary"
              />
              <button
                type="button"
                onClick={handleCustomGenerate}
                disabled={customLoading}
                className="btn-primary w-full mt-3 py-3 disabled:opacity-60"
              >
                {customLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{customLoading ? '생성 중…' : 'AI로 만들기'}</span>
              </button>
            </div>
            {customResult && (
              <div className="ig-card p-5 rounded-xl space-y-4">
                <div className="aspect-square max-h-56 rounded-xl overflow-hidden bg-ig-background">
                  <img src={customResult.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-ig-text-secondary mb-1">캡션·해시태그 (수정 가능)</span>
                  <textarea
                    className="w-full min-h-[88px] rounded-xl border border-ig-border bg-ig-background px-3 py-2 text-sm text-ig-secondary resize-none"
                    value={customCaption}
                    onChange={(e) => setCustomCaption(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={openScheduleFromCustom} className="btn-outline py-3">
                    <CalendarClock className="w-4 h-4" />
                    <span>예약하기</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadFromCustom}
                    disabled={uploading}
                    className="btn-primary py-3 disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>{uploading ? '업로드 중…' : '인스타 업로드'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'photo' && (
        <div className="mb-6">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />

          {!photoPreview ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full py-20 rounded-xl border-2 border-dashed border-ig-border bg-white ig-card flex flex-col items-center justify-center gap-3 text-ig-text-secondary hover:border-ig-primary/50 transition-colors"
            >
              <ImagePlus className="w-14 h-14" />
              <span className="text-sm font-medium">사진 선택</span>
            </button>
          ) : (
            <div className="space-y-5">
              <div className="ig-card rounded-xl overflow-hidden">
                {!photoResult ? (
                  <div className="aspect-square max-h-72 w-full flex items-center justify-center bg-ig-background relative">
                    {photoLoading && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 z-10">
                        <Loader2 className="w-10 h-10 animate-spin text-white" />
                        <span className="text-white text-sm font-medium">
                          {photoMode === 'reels' ? '릴스 영상 생성 중…' : '게시글 준비 중…'}
                        </span>
                      </div>
                    )}
                    <img src={photoPreview} alt="선택한 사진" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="aspect-square max-h-72 w-full bg-ig-background relative">
                    <img src={photoPreview} alt="" className="w-full h-full object-contain" />
                    {photoResult.isReelsVideo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!photoResult ? (
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline py-3">
                    다른 사진
                  </button>
                  <button
                    type="button"
                    onClick={handlePhotoAsReels}
                    disabled={photoLoading}
                    className="btn-primary py-3 disabled:opacity-60"
                  >
                    <Film className="w-4 h-4" />
                    <span>릴스</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePhotoAsFeed}
                    disabled={photoLoading}
                    className="btn-outline py-3 border-ig-primary text-ig-primary disabled:opacity-60"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>피드</span>
                  </button>
                </div>
              ) : (
                <div className="ig-card p-5 rounded-xl space-y-4">
                  {photoMode === 'reels' && photoResult.musicLabel && (
                    <p className="text-sm text-ig-secondary flex items-center gap-2">
                      <Music className="w-4 h-4 flex-shrink-0" />
                      {photoResult.musicLabel}
                    </p>
                  )}
                  {photoResult.caption && (
                    <div>
                      <span className="block text-xs font-medium text-ig-text-secondary mb-1">캡션·해시태그 (수정 가능)</span>
                      <textarea
                        className="w-full min-h-[96px] rounded-xl border border-ig-border bg-ig-background px-3 py-2 text-sm text-ig-secondary resize-none"
                        value={captionText}
                        onChange={(e) => setCaptionText(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={openScheduleFromPhoto} className="btn-outline py-3">
                      <CalendarClock className="w-4 h-4" />
                      <span>예약하기</span>
                    </button>
                    <button type="button" onClick={handleInstagramUploadFromPhoto} disabled={uploading} className="btn-primary py-3 disabled:opacity-60">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>{uploading ? '업로드 중…' : '인스타 업로드'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {tab === 'schedule' && (
        <section className="space-y-4">
          <div className="ig-card rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ig-secondary">AI 자동 업로드</h3>
              <span className="text-[10px] text-ig-primary font-medium flex items-center gap-1">
                <Hash className="w-3 h-3" />
                인사이트 추천 {recommendedHourLabel}
              </span>
            </div>
            <p className="text-xs text-ig-text-secondary">
              주제를 따로 고르지 않아도, 인사이트를 참고해 AI가 어울리는 게시물을 알아서 올려줘요.
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-ig-text-secondary mb-1">날짜</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ig-border bg-ig-background text-ig-secondary text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-ig-text-secondary mb-1">시간</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-ig-border bg-ig-background text-ig-secondary text-sm"
                  />
                  <button
                    type="button"
                    onClick={applyRecommendedTime}
                    className="btn-outline px-3 py-2 text-[11px]"
                  >
                    인사이트 추천
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const at = formatScheduleAt(
                  scheduleDate || new Date().toISOString().slice(0, 10),
                  scheduleTime || RECOMMENDED_PEAK_HOUR + ':00',
                )
                setScheduleList((prev) => [
                  ...prev,
                  { id: Date.now().toString(), title: 'AI 자동 업로드', kind: 'feed', at },
                ])
                showToast(`${at}에 AI 자동 업로드가 예약되었습니다.`)
              }}
              className="btn-primary w-full py-3"
            >
              <CalendarClock className="w-4 h-4" />
              <span>AI 자동 업로드 예약</span>
            </button>
          </div>

          <section className="ig-card rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-ig-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ig-secondary">예약 목록</h3>
              <span className="text-[10px] text-ig-text-secondary">콘텐츠에서 예약한 업로드가 여기 모여요.</span>
            </div>
            <div className="p-4">
              {scheduleList.length === 0 ? (
                <p className="text-sm text-ig-text-secondary py-4 text-center">예약된 업로드가 없어요.</p>
              ) : (
                <ul className="space-y-2">
                  {scheduleList.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-ig-background">
                      <span className={item.kind === 'reels' ? 'text-ig-primary' : 'text-ig-text-secondary'}>
                        {item.kind === 'reels' ? <Film className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                      </span>
                      <span className="text-sm text-ig-secondary flex-1 truncate">{item.title}</span>
                      <span className="text-xs text-ig-text-secondary">{item.at}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </section>
      )}

      {/* 추천 주제 생성 모달: 캡션 수정 + 인스타 업로드 / 예약 */}
      <Modal open={!!modalTopic} onClose={() => setModalTopic(null)} title="AI가 만든 이미지·캡션">
        {modalTopic && (
          <div className="p-4 space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-ig-background">
              <img src={modalTopic.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="block text-xs font-medium text-ig-text-secondary mb-1">캡션·해시태그 (수정 가능)</span>
              <textarea
                className="w-full min-h-[100px] rounded-xl border border-ig-border bg-ig-background px-3 py-2 text-sm text-ig-secondary resize-none"
                value={modalCaption}
                onChange={(e) => setModalCaption(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={openScheduleFromModal} className="btn-outline py-3">
                <CalendarClock className="w-4 h-4" />
                <span>예약하기</span>
              </button>
              <button type="button" onClick={handleUploadFromModal} disabled={uploading} className="btn-primary py-3 disabled:opacity-60">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{uploading ? '업로드 중…' : '인스타 업로드'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 예약하기 모달 */}
      <Modal
        open={scheduleModalOpen}
        onClose={() => { setScheduleModalOpen(false); setScheduleTarget(null) }}
        title="업로드 예약"
      >
        <div className="p-4 space-y-4">
          {scheduleTarget && (
            <>
              <p className="text-sm text-ig-secondary">인사이트 기준 방문자가 많은 시간을 추천해 드려요.</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-ig-text-secondary mb-1">날짜</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ig-border bg-ig-background text-ig-secondary text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-ig-text-secondary mb-1">시간 (추천 {recommendedHourLabel})</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ig-border bg-ig-background text-ig-secondary text-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={scheduleSource === 'modal' ? handleScheduleSubmit : scheduleSource === 'photo' ? handleScheduleFromPhoto : handleScheduleFromCustom}
                className="btn-primary w-full py-3"
              >
                <CalendarClock className="w-4 h-4" />
                <span>예약 등록</span>
              </button>
            </>
          )}
        </div>
      </Modal>

      <Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  )
}
