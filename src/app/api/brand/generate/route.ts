import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const JINA_API_KEY = process.env.JINA_API_KEY

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { keywords, industry, targetCustomer, atmosphere } = body as {
      keywords: string[]
      industry?: string
      targetCustomer?: string
      atmosphere?: string
    }
    if (!keywords?.length) {
      return NextResponse.json({ error: 'keywords 배열이 필요합니다.' }, { status: 400 })
    }

    const text = [industry, targetCustomer, atmosphere, ...keywords].filter(Boolean).join(', ')

    let accountId = ''
    let bio = ''
    let profileImageUrl: string | null = null

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
                '당신은 SNS 마케팅 전문가입니다. 한국어로만 답하고, 짧고 기억하기 쉬운 계정 ID와 소개글을 만들어주세요.',
            },
            {
              role: 'user',
              content: `다음 키워드로 인스타/스레드용 브랜드 프로필을 만들어주세요. JSON만 출력하고 다른 말 없이.\n키워드: ${text}\n출력 형식: {"accountId": "영문_숫자_조합_짧게", "bio": "2~3문장 소개글 이모지 포함 가능"}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(`OpenAI: ${res.status} ${err}`)
      }
      const data = await res.json()
      const content = data.choices?.[0]?.message?.content
      if (content) {
        const parsed = JSON.parse(content) as { accountId?: string; bio?: string }
        accountId = parsed.accountId || `brand_${Date.now().toString(36)}`
        bio = parsed.bio || `${text}를 기반으로 한 브랜드입니다.`
      }
    } else {
      accountId = `brand_${Date.now().toString(36)}`
      bio = `✨ ${text}\n문의 환영합니다.`
    }

    if (OPENAI_API_KEY && text) {
      const imageRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `Minimal, modern logo or profile image for a brand. Keywords: ${text}. Simple, clean, square format, suitable for social media profile. No text in image.`,
          n: 1,
          size: '1024x1024',
          response_format: 'url',
          quality: 'standard',
        }),
      })
      if (imageRes.ok) {
        const imageData = await imageRes.json()
        profileImageUrl = imageData.data?.[0]?.url ?? null
      }
    }

    const candidates = [
      accountId,
      text.replace(/\s+/g, '_').slice(0, 20),
      `brand_${keywords[0]?.slice(0, 8) || 'main'}`,
    ]
    let finalAccountId = accountId
    if (JINA_API_KEY && candidates.length > 1) {
      try {
        const { jinaRerank } = await import('@/lib/jina')
        const results = await jinaRerank(
          JINA_API_KEY,
          `SNS account ID for: ${text}, short memorable`,
          candidates,
          { top_n: 1 }
        )
        if (results[0]?.document?.text) finalAccountId = results[0].document.text
        else if (results[0] !== undefined) finalAccountId = candidates[results[0].index] ?? accountId
      } catch {
        // keep accountId from OpenAI
      }
    }

    return NextResponse.json({
      accountId: finalAccountId,
      bio,
      profileImageUrl,
      keywords,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '브랜드 생성 실패' },
      { status: 500 }
    )
  }
}
