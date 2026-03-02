/**
 * Jina AI API 유틸
 * Get your Jina AI API key for free: https://jina.ai/?sui=apikey
 */

const JINA_BASE = 'https://api.jina.ai'
const headers = (apiKey: string) => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiKey}`,
})

export async function jinaEmbeddings(
  apiKey: string,
  input: string[],
  options?: { model?: string; task?: string }
) {
  const res = await fetch(`${JINA_BASE}/v1/embeddings`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      model: options?.model ?? 'jina-embeddings-v3',
      input,
      task: options?.task ?? 'retrieval.passage',
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Jina Embeddings: ${res.status} ${err}`)
  }
  const data = await res.json()
  return data.data as { embedding: number[] }[]
}

export async function jinaRerank(
  apiKey: string,
  query: string,
  documents: string[],
  options?: { top_n?: number; model?: string }
) {
  const res = await fetch(`${JINA_BASE}/v1/rerank`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      model: options?.model ?? 'jina-reranker-v2-base-multilingual',
      query,
      documents,
      top_n: options?.top_n ?? documents.length,
      return_documents: true,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Jina Rerank: ${res.status} ${err}`)
  }
  const data = await res.json()
  return data.results as { index: number; relevance_score: number; document?: { text?: string } }[]
}
