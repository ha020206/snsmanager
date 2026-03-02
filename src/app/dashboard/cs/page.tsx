'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { getCSRules, saveCSRule } from '@/lib/store'
import type { CSRule } from '@/types'
import { Plus, Send } from 'lucide-react'

export default function CSPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [rules, setRules] = useState<CSRule[]>([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [keywords, setKeywords] = useState('')
  const [reply, setReply] = useState<string | null>(null)
  const [replyLoading, setReplyLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getCSRules(user.uid).then((list) => setRules(list.filter((r) => !(r as CSRule & { _deleted?: boolean })._deleted)))
  }, [user])

  const addRule = async () => {
    if (!user || !question.trim() || !answer.trim()) return
    setSaveLoading(true)
    try {
      await saveCSRule(user.uid, {
        question: question.trim(),
        answer: answer.trim(),
        keywords: keywords.split(/[\s,]+/).filter(Boolean),
      })
      setQuestion('')
      setAnswer('')
      setKeywords('')
      setShowForm(false)
      getCSRules(user.uid).then((list) => setRules(list.filter((r) => !(r as CSRule & { _deleted?: boolean })._deleted)))
    } catch (e) {
      alert(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setSaveLoading(false)
    }
  }

  const getAutoReply = async () => {
    if (!question.trim() || rules.length === 0) {
      setReply('자동 답변 규칙을 먼저 추가해주세요.')
      return
    }
    setReplyLoading(true)
    setReply(null)
    try {
      const res = await fetch('/api/cs/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          rules: rules.map((r) => ({
            id: r.id,
            question: r.question,
            answer: r.answer,
            keywords: r.keywords,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '조회 실패')
      if (data.matched && data.answer) {
        setReply(data.answer)
      } else {
        setReply('매칭되는 자동 답변이 없어요. 규칙을 추가해보세요.')
      }
    } catch (e) {
      setReply(e instanceof Error ? e.message : '오류 발생')
    } finally {
      setReplyLoading(false)
    }
  }

  if (loading || !user) return null

  return (
    <div className="pb-4">
      <header className="sticky top-0 z-10 bg-white border-b border-ig-border px-4 py-3">
        <h1 className="text-xl font-semibold text-ig-secondary">CS 자동화</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="ig-card p-4 space-y-3">
          <p className="text-sm font-medium text-ig-secondary">질문 미리보기</p>
          <input
            type="text"
            placeholder="고객 질문 입력 (예: 예약 가능해요?)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-ig-background border border-ig-border text-ig-secondary placeholder-ig-text-secondary text-sm"
          />
          <button
            onClick={getAutoReply}
            disabled={replyLoading}
            className="w-full py-2.5 rounded-lg bg-ig-primary text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {replyLoading ? '확인 중...' : '자동 답변 확인'}
          </button>
          {reply !== null && (
            <div className="mt-3 p-3 rounded-lg bg-ig-background border border-ig-border">
              <p className="text-xs text-ig-text-secondary mb-1">제안 답변</p>
              <p className="text-sm text-ig-secondary whitespace-pre-wrap">{reply}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-ig-secondary">자동 답변 규칙</p>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="p-2 rounded-full bg-ig-background text-ig-secondary"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {showForm && (
          <div className="ig-card p-4 space-y-3">
            <input
              type="text"
              placeholder="질문 (예: 예약 어떻게 해요?)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-ig-background border border-ig-border text-ig-secondary placeholder-ig-text-secondary text-sm"
            />
            <textarea
              placeholder="답변 내용"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-ig-background border border-ig-border text-ig-secondary placeholder-ig-text-secondary text-sm resize-none"
            />
            <input
              type="text"
              placeholder="키워드 (쉼표 구분)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-ig-background border border-ig-border text-ig-secondary placeholder-ig-text-secondary text-sm"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg border border-ig-border text-ig-secondary text-sm font-medium">
                취소
              </button>
              <button
                onClick={addRule}
                disabled={saveLoading}
                className="flex-1 py-2 rounded-lg bg-ig-primary text-white text-sm font-semibold disabled:opacity-50"
              >
                {saveLoading ? '저장 중...' : '규칙 추가'}
              </button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {rules.map((r) => (
            <li key={r.id} className="ig-card p-4">
              <p className="font-medium text-ig-secondary text-sm">{r.question}</p>
              <p className="text-sm text-ig-text-secondary mt-1 whitespace-pre-wrap">{r.answer}</p>
              {r.keywords?.length ? (
                <p className="text-xs text-ig-text-secondary mt-2">키워드: {r.keywords.join(', ')}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
