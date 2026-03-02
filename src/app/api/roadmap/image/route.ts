import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY가 설정되지 않았습니다.' },
      { status: 503 }
    )
  }
  try {
    const body = await req.json()
    const { prompt } = body as { prompt: string }
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt가 필요합니다.' }, { status: 400 })
    }

    const imageRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `High quality social media image, Instagram or Reels style. ${prompt}. No text overlay. Square format.`,
        n: 1,
        size: '1024x1024',
        response_format: 'url',
        quality: 'standard',
      }),
    })
    if (!imageRes.ok) {
      const err = await imageRes.text()
      throw new Error(`OpenAI Image: ${imageRes.status} ${err}`)
    }
    const data = await imageRes.json()
    const url = data.data?.[0]?.url ?? null
    return NextResponse.json({ url })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '이미지 생성 실패' },
      { status: 500 }
    )
  }
}
