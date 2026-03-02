import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const JINA_API_KEY = process.env.JINA_API_KEY

const DEFAULT_TOPICS = [
  '브랜드 소개 및 스토리',
  '인기 메뉴/상품 하이라이트',
  '직원/제작 과정 비하인드',
  '이벤트 및 프로모션',
  '고객 후기 및 리뷰',
  '계절/테마 특집',
  '팁 및 활용법',
  '새 메뉴/신제품 출시',
  '운영 시간·위치 안내',
  '커뮤니티 참여 유도',
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { brandContext, count = 8 } = body as { brandContext?: string; count?: number }
    const context = brandContext || '일반 브랜드'

    let topics: { title: string; description: string; imagePrompt?: string }[] = []

    if (OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                '당신은 SNS 콘텐츠 기획자입니다. 한국어로만 답하고, JSON 배열만 출력하세요.',
            },
            {
              role: 'user',
              content: `"${context}"에 맞는 인스타그램/릴스 게시물 주제 ${count}개를 단계별로 추천해주세요. 각 항목은 title(주제명), description(한 줄 설명), imagePrompt(이미지 생성용 영어 프롬프트, 간단히)를 포함. JSON 배열만 출력. 예: [{"title":"...","description":"...","imagePrompt":"..."}]`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (content) {
          const parsed = JSON.parse(content) as { items?: typeof topics; topics?: typeof topics } | typeof topics
          const arr = Array.isArray(parsed)
            ? parsed
            : (parsed as { items?: typeof topics; topics?: typeof topics })?.items ??
              (parsed as { topics?: typeof topics })?.topics
          if (Array.isArray(arr)) topics = arr.slice(0, count)
        }
      }
    }

    if (topics.length === 0) {
      topics = DEFAULT_TOPICS.slice(0, count).map((t) => ({
        title: t,
        description: `${t} 콘텐츠로 브랜드 인지도를 높여보세요.`,
        imagePrompt: `modern social media image for ${t}`,
      }))
    }

    if (JINA_API_KEY && topics.length > 1) {
      try {
        const { jinaRerank } = await import('@/lib/jina')
        const docs = topics.map((t) => `${t.title}. ${t.description}`)
        const results = await jinaRerank(
          JINA_API_KEY,
          `SNS content roadmap order for: ${context}, from intro to engagement`,
          docs,
          { top_n: topics.length }
        )
        const ordered = results.map((r) => topics[r.index]).filter(Boolean)
        if (ordered.length) topics = ordered
      } catch {
        // keep current order
      }
    }

    return NextResponse.json({ roadmap: topics })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '로드맵 생성 실패' },
      { status: 500 }
    )
  }
}
