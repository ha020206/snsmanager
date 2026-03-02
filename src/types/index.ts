export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: number
}

export interface BrandProfile {
  id: string
  userId: string
  keywords: string[]
  accountId: string
  bio: string
  profileImageUrl: string | null
  industry?: string
  targetCustomer?: string
  atmosphere?: string
  createdAt: number
  updatedAt: number
}

export interface ContentRoadmapItem {
  id: string
  userId: string
  brandId?: string
  order: number
  title: string
  description: string
  suggestedImagePrompt?: string
  generatedImageUrl?: string | null
  postedAt?: number | null
  createdAt: number
}

export interface InsightMetric {
  date: string
  views: number
  likes: number
  comments: number
  saves: number
  bestHour: number
}

export interface PostInsight {
  id: string
  title: string
  type: 'post' | 'reel'
  publishedAt: number
  views: number
  likes: number
  comments: number
  bestHour: number
}

export interface CSRule {
  id: string
  userId: string
  question: string
  answer: string
  keywords: string[]
  createdAt: number
}

export interface CSAutoReplyResult {
  matched: boolean
  answer: string | null
  ruleId: string | null
  score?: number
}
