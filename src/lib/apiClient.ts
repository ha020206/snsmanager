/**
 * GitHub Pages 등 정적 호스팅에서는 서버 API가 없으므로 mock 응답 사용.
 * 로컬 개발( next dev )에서는 /api/* 호출.
 */
function isStaticSite(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hostname.includes('github.io')
}

function getBase(): string {
  if (typeof window === 'undefined') return ''
  const path = window.location.pathname
  if (path.startsWith('/snsmanager')) return '/snsmanager'
  return ''
}

const DEFAULT_TOPICS = [
  { title: '브랜드 소개', description: '첫 인상을 위한 소개 콘텐츠', imagePrompt: 'brand intro' },
  { title: '인기 메뉴/상품', description: '대표 메뉴나 상품 하이라이트', imagePrompt: 'popular menu' },
  { title: '비하인드', description: '제작 과정이나 팀 소개', imagePrompt: 'behind the scenes' },
  { title: '이벤트·프로모션', description: '기간 한정 이벤트 안내', imagePrompt: 'event promotion' },
  { title: '고객 후기', description: '리뷰와 후기 공유', imagePrompt: 'customer review' },
  { title: '계절/테마 특집', description: '시즌별 테마 콘텐츠', imagePrompt: 'seasonal theme' },
  { title: '팁·활용법', description: '유용한 정보 공유', imagePrompt: 'tips and how-to' },
  { title: '운영 안내', description: '영업시간·위치·문의 안내', imagePrompt: 'info and location' },
]

export async function apiBrandGenerate(body: {
  keywords: string[]
  industry?: string
  targetCustomer?: string
  atmosphere?: string
}): Promise<{ accountId: string; bio: string; profileImageUrl: string | null }> {
  if (!isStaticSite()) {
    const base = getBase()
    const res = await fetch(`${base}/api/brand/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || '생성 실패')
    return data
  }
  const parts = [body.industry, body.targetCustomer, body.atmosphere, ...(body.keywords || [])].filter(Boolean)
  return {
    accountId: `brand_${Date.now().toString(36)}`,
    bio: `✨ ${parts.join(' ')}\n문의 환영합니다.`,
    profileImageUrl: null,
  }
}

export async function apiRoadmapGenerate(body: {
  brandContext?: string
  count?: number
}): Promise<{ roadmap: { title: string; description: string; imagePrompt?: string }[] }> {
  if (!isStaticSite()) {
    const base = getBase()
    const res = await fetch(`${base}/api/roadmap/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || '생성 실패')
    return data
  }
  const count = Math.min(body.count ?? 8, DEFAULT_TOPICS.length)
  return { roadmap: DEFAULT_TOPICS.slice(0, count) }
}

export async function apiRoadmapImage(body: { prompt: string }): Promise<{ url: string | null }> {
  if (!isStaticSite()) {
    const base = getBase()
    const res = await fetch(`${base}/api/roadmap/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || '이미지 생성 실패')
    return data
  }
  return { url: null }
}

export async function apiCSReply(body: {
  question: string
  rules: { id: string; question: string; answer: string; keywords?: string[] }[]
}): Promise<{ matched: boolean; answer: string | null; ruleId: string | null }> {
  if (!isStaticSite()) {
    const base = getBase()
    const res = await fetch(`${base}/api/cs/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || '조회 실패')
    return data
  }
  const q = body.question.trim().toLowerCase()
  for (const r of body.rules || []) {
    const kws = [...(r.keywords || []), r.question].join(' ').toLowerCase()
    if (kws && q && (q.includes(kws.slice(0, 5)) || r.question.toLowerCase().includes(q.slice(0, 4)))) {
      return { matched: true, answer: r.answer, ruleId: r.id }
    }
  }
  for (const r of body.rules || []) {
    if (r.question.toLowerCase().includes(q) || q.includes(r.question.toLowerCase().slice(0, 6))) {
      return { matched: true, answer: r.answer, ruleId: r.id }
    }
  }
  return { matched: false, answer: null, ruleId: null }
}
