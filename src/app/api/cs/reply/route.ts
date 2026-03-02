import { NextRequest, NextResponse } from 'next/server'
import { jinaEmbeddings } from '@/lib/jina'
import { jinaRerank } from '@/lib/jina'

const JINA_API_KEY = process.env.JINA_API_KEY

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  const den = Math.sqrt(na) * Math.sqrt(nb)
  return den === 0 ? 0 : dot / den
}

export async function POST(req: NextRequest) {
  if (!JINA_API_KEY) {
    return NextResponse.json(
      { error: 'JINA_API_KEY가 설정되지 않았습니다.' },
      { status: 503 }
    )
  }
  try {
    const body = await req.json()
    const { question, rules } = body as {
      question: string
      rules: { id: string; question: string; answer: string; keywords?: string[] }[]
    }
    if (!question?.trim() || !Array.isArray(rules) || rules.length === 0) {
      return NextResponse.json({
        matched: false,
        answer: null,
        ruleId: null,
      })
    }

    const texts = rules.map((r) => r.question + ' ' + (r.keywords?.join(' ') || ''))
    const [queryEmb, docEmbs] = await Promise.all([
      jinaEmbeddings(JINA_API_KEY, [question], { task: 'retrieval.query' }),
      jinaEmbeddings(JINA_API_KEY, texts, { task: 'retrieval.passage' }),
    ])
    const q = queryEmb[0]?.embedding
    if (!q) {
      return NextResponse.json({ matched: false, answer: null, ruleId: null })
    }

    const scores = docEmbs.map((d, i) => ({
      index: i,
      score: cosineSimilarity(q, d.embedding),
    }))
    scores.sort((a, b) => b.score - a.score)
    const best = scores[0]
    const threshold = 0.6
    if (best && best.score >= threshold) {
      const rule = rules[best.index]
      return NextResponse.json({
        matched: true,
        answer: rule.answer,
        ruleId: rule.id,
        score: best.score,
      })
    }

    const rerankDocs = rules.map((r) => r.question)
    const reranked = await jinaRerank(JINA_API_KEY, question, rerankDocs, { top_n: 1 })
    const top = reranked[0]
    if (top && top.relevance_score >= 0.5) {
      const rule = rules[top.index]
      return NextResponse.json({
        matched: true,
        answer: rule.answer,
        ruleId: rule.id,
        score: top.relevance_score,
      })
    }

    return NextResponse.json({
      matched: false,
      answer: null,
      ruleId: null,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'CS 자동 응답 실패' },
      { status: 500 }
    )
  }
}
