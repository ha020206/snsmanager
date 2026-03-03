'use client'

import { useState } from 'react'
import { MessageCircle, Bot, Send, ChevronLeft } from 'lucide-react'

type Message = {
  id: string
  sender: 'customer' | 'bot'
  text: string
  isAutoReply?: boolean
}

type ChatThread = {
  id: string
  customerName: string
  preview: string
  time: string
  unread?: boolean
  messages: Message[]
}

type CommentItem = {
  id: string
  postPreview: string
  author: string
  text: string
  time: string
  autoReply?: string
}

const MOCK_CHATS: ChatThread[] = [
  { id: '1', customerName: '김**', preview: '주차 가능한가요?', time: '오늘 14:32', unread: true, messages: [
    { id: 'm1', sender: 'customer', text: '안녕하세요, 혹시 내일 오후 2시쯤 주차 가능한가요?' },
    { id: 'm2', sender: 'bot', text: '안녕하세요! 카페 브리즈입니다 😊 저희 매장 건물 뒤편에 4대까지 주차 가능한 전용 주차장이 마련되어 있습니다. 만차 시 도보 3분 거리의 공영주차장을 이용해 주세요!', isAutoReply: true },
  ]},
  { id: '2', customerName: '이**', preview: '반려동물 동반 가능한가요?', time: '오늘 11:20', unread: false, messages: [
    { id: 'm3', sender: 'customer', text: '반려동물 동반 가능한가요?' },
    { id: 'm4', sender: 'bot', text: '네, 환영합니다! 🐶 야외 테라스에서 반려동물과 함께 이용하실 수 있으며, 물 대기 서비스도 제공하고 있어요.', isAutoReply: true },
  ]},
  { id: '3', customerName: '박**', preview: '영업시간이 어떻게 되나요?', time: '어제 18:45', unread: false, messages: [
    { id: 'm5', sender: 'customer', text: '영업시간이 어떻게 되나요?' },
    { id: 'm6', sender: 'bot', text: '매일 11:00 - 21:00 영업 중입니다. 주말에도 동일해요.', isAutoReply: true },
  ]},
]

const MOCK_COMMENTS: CommentItem[] = [
  { id: 'c1', postPreview: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100&h=100&fit=crop', author: 'user_***', text: '영업시간 알려주세요!', time: '오늘 12:00', autoReply: '매일 11:00 - 21:00 영업 중입니다. 주말에도 동일해요 😊' },
  { id: 'c2', postPreview: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100&h=100&fit=crop', author: 'cafe_lover', text: '주차 되나요?', time: '오늘 10:30', autoReply: '안녕하세요! 건물 뒤편 전용 주차장 4대 가능합니다. 만차 시 도보 3분 거리 공영주차장 이용해 주세요.' },
  { id: 'c3', postPreview: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&h=100&fit=crop', author: 'min_*', text: '예약 가능해요?', time: '어제 20:00', autoReply: '현재 선착순 운영 중이에요. 단체(8인 이상)는 DM으로 미리 문의해 주시면 안내해 드릴게요!' },
]

const QUICK_REPLIES: { label: string; question: string; answer: string }[] = [
  { label: '주차', question: '주차 가능한가요?', answer: '안녕하세요! 카페 브리즈입니다 😊 건물 뒤편 전용 주차장 4대 가능합니다. 만차 시 도보 3분 거리 공영주차장 이용해 주세요!' },
  { label: '영업시간', question: '영업시간?', answer: '매일 11:00 - 21:00 영업 중입니다. 주말에도 동일해요.' },
  { label: '예약', question: '예약 가능해요?', answer: '현재 선착순 운영 중이에요. 단체(8인 이상)는 DM으로 문의해 주세요!' },
]

type CsTab = 'dm' | 'comment'

export default function CSPage() {
  const [csTab, setCsTab] = useState<CsTab>('dm')
  const [selectedId, setSelectedId] = useState<string>('')
  const [inputValue, setInputValue] = useState('')
  const [previewReply, setPreviewReply] = useState<{ question: string; answer: string } | null>(null)

  const selectedChat = MOCK_CHATS.find((c) => c.id === selectedId)
  const showList = selectedId === ''
  const displayMessages =
    selectedChat == null
      ? []
      : previewReply
      ? [
          ...selectedChat.messages,
          { id: 'pr-q', sender: 'customer' as const, text: previewReply.question },
          { id: 'pr-a', sender: 'bot' as const, text: previewReply.answer, isAutoReply: true },
        ]
      : selectedChat.messages

  const handleSend = () => {
    if (!inputValue.trim()) return
    setInputValue('')
    setPreviewReply(null)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden p-4 pb-0">
      <div className="flex rounded-xl bg-ig-background p-1 mb-3 flex-shrink-0">
        <button type="button" onClick={() => setCsTab('dm')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${csTab === 'dm' ? 'bg-white text-ig-secondary shadow-sm' : 'text-ig-text-secondary'}`}>
          DM
        </button>
        <button type="button" onClick={() => setCsTab('comment')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${csTab === 'comment' ? 'bg-white text-ig-secondary shadow-sm' : 'text-ig-text-secondary'}`}>
          댓글
        </button>
      </div>

      {csTab === 'dm' && (
        <div className="flex-1 flex min-h-0 rounded-xl border border-ig-border bg-white overflow-hidden">
          <div className={`flex flex-col border-r border-ig-border flex-shrink-0 ${showList ? 'flex w-full' : 'hidden'}`}>
            <div className="p-2 border-b border-ig-border flex-shrink-0">
              <p className="text-xs font-semibold text-ig-secondary">채팅</p>
            </div>
            <ul className="flex-1 overflow-y-auto min-h-0">
              {MOCK_CHATS.map((chat) => (
                <li key={chat.id}>
                  <button type="button" onClick={() => { setSelectedId(chat.id); setPreviewReply(null); }} className={`w-full text-left px-3 py-2.5 flex items-center gap-2 border-b border-ig-border ${selectedId === chat.id ? 'bg-ig-background' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-ig-border flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-ig-text-secondary" />
                      </div>
                      {chat.unread && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-ig-primary" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ig-secondary text-xs truncate">{chat.customerName}</p>
                      <p className="text-[10px] text-ig-text-secondary truncate">{chat.preview}</p>
                    </div>
                    <span className="text-[10px] text-ig-text-secondary flex-shrink-0">{chat.time}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${showList ? 'hidden' : 'flex'}`}>
            <div className="px-3 py-2 border-b border-ig-border bg-white flex items-center gap-2 flex-shrink-0">
              <button type="button" onClick={() => setSelectedId('')} className="p-1.5 rounded-full text-ig-secondary" aria-label="목록">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold text-ig-secondary text-sm truncate">
                {selectedId && selectedChat ? selectedChat.customerName : '메시지'}
              </span>
            </div>
            {!selectedId ? (
              <div className="flex-1 flex items-center justify-center p-4 text-ig-text-secondary text-sm">
                왼쪽에서 대화를 선택하세요.
              </div>
            ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              {displayMessages.map((msg) => (
                <div key={msg.id} className={`flex gap-1.5 ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-ig-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-ig-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.sender === 'customer' ? 'bg-ig-primary text-white' : 'bg-white border border-ig-border text-ig-secondary'}`}>
                    {msg.sender === 'bot' && (msg as Message).isAutoReply && (
                      <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 mb-1">
                        <Bot className="w-2.5 h-2.5" /> 자동응답
                      </span>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            )}
            {selectedId && (
              <div className="p-2 border-t border-ig-border bg-white flex-shrink-0">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {QUICK_REPLIES.map((item) => (
                    <button key={item.label} type="button" onClick={() => setPreviewReply({ question: item.question, answer: item.answer })} className="px-2 py-1 rounded-full border border-ig-border text-ig-secondary text-[10px] font-medium">
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <input type="text" placeholder="메시지 입력" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 min-w-0 px-3 py-2 rounded-full bg-ig-background border border-ig-border text-ig-secondary text-sm focus:outline-none focus:ring-1 focus:ring-ig-primary" />
                  <button type="button" onClick={handleSend} disabled={!inputValue.trim()} className="p-2 rounded-full bg-ig-primary text-white disabled:opacity-40 flex-shrink-0" aria-label="전송">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {csTab === 'comment' && (
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
          <p className="text-xs text-ig-text-secondary mb-2">게시물 댓글에 AI가 자동 응답한 내역이에요.</p>
          {MOCK_COMMENTS.map((c) => (
            <div key={c.id} className="rounded-xl border border-ig-border bg-white p-3">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-ig-background flex-shrink-0">
                  <img src={c.postPreview} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-ig-text-secondary">{c.author} · {c.time}</p>
                  <p className="text-sm text-ig-secondary font-medium mt-0.5">{c.text}</p>
                  {c.autoReply && (
                    <div className="mt-2 pl-2 border-l-2 border-ig-primary/30">
                      <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-0.5"><Bot className="w-3 h-3" /> 자동응답</span>
                      <p className="text-xs text-ig-secondary mt-0.5">{c.autoReply}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
