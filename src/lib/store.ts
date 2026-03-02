/**
 * 프로토타입용 인메모리 스토어 (새로고침 시 데이터 초기화)
 */
import type { BrandProfile, ContentRoadmapItem, CSRule, InsightMetric } from '@/types'

const PROTO_UID = 'local'

let brandProfiles: BrandProfile[] = []
let contentRoadmap: ContentRoadmapItem[] = []
let csRules: CSRule[] = []
let insights: InsightMetric[] = []
let insightPosts: { id: string; title: string; type: string; publishedAt: number; views: number; likes: number; comments: number }[] = []

let idSeq = 0
function nextId() {
  return `local_${++idSeq}_${Date.now()}`
}

export function getBrandProfiles(_userId: string): Promise<BrandProfile[]> {
  return Promise.resolve([...brandProfiles].sort((a, b) => b.updatedAt - a.updatedAt))
}

export function getBrandProfile(id: string): Promise<BrandProfile | null> {
  const found = brandProfiles.find((b) => b.id === id)
  return Promise.resolve(found ?? null)
}

export function saveBrandProfile(
  userId: string,
  data: Omit<BrandProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> {
  const now = Date.now()
  if (data.id && brandProfiles.some((b) => b.id === data.id)) {
    const idx = brandProfiles.findIndex((b) => b.id === data.id)
    const { id, ...rest } = data
    brandProfiles[idx] = { ...brandProfiles[idx], ...rest, id: id!, updatedAt: now }
    return Promise.resolve(id!)
  }
  const id = nextId()
  brandProfiles.push({
    ...data,
    id,
    userId,
    createdAt: now,
    updatedAt: now,
  } as BrandProfile)
  return Promise.resolve(id)
}

export function getRoadmap(userId: string, brandId?: string): Promise<ContentRoadmapItem[]> {
  let list = contentRoadmap.filter((r) => r.userId === userId)
  if (brandId) list = list.filter((r) => r.brandId === brandId)
  list = [...list].sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
  return Promise.resolve(list)
}

export function saveRoadmapItem(
  userId: string,
  item: Omit<ContentRoadmapItem, 'id' | 'userId' | 'createdAt'> & { id?: string }
): Promise<string> {
  const now = Date.now()
  if (item.id && contentRoadmap.some((r) => r.id === item.id)) {
    const idx = contentRoadmap.findIndex((r) => r.id === item.id)
    const { id, ...rest } = item
    contentRoadmap[idx] = { ...contentRoadmap[idx], ...rest, id: item.id!, createdAt: contentRoadmap[idx].createdAt }
    return Promise.resolve(item.id!)
  }
  const id = nextId()
  contentRoadmap.push({
    ...item,
    id,
    userId,
    createdAt: now,
  } as ContentRoadmapItem)
  return Promise.resolve(id)
}

export function getCSRules(userId: string): Promise<CSRule[]> {
  const list = csRules.filter((r) => r.userId === userId && !(r as CSRule & { _deleted?: boolean })._deleted)
  return Promise.resolve([...list].sort((a, b) => b.createdAt - a.createdAt))
}

export function saveCSRule(
  userId: string,
  rule: Omit<CSRule, 'id' | 'userId' | 'createdAt'> & { id?: string }
): Promise<string> {
  const now = Date.now()
  if (rule.id && csRules.some((r) => r.id === rule.id)) {
    const idx = csRules.findIndex((r) => r.id === rule.id)
    csRules[idx] = { ...rule, id: rule.id!, userId, createdAt: csRules[idx].createdAt } as CSRule
    return Promise.resolve(rule.id)
  }
  const id = nextId()
  csRules.push({ ...rule, id, userId, createdAt: now } as CSRule)
  return Promise.resolve(id)
}

export function deleteCSRule(userId: string, id: string): Promise<void> {
  const r = csRules.find((x) => x.id === id && x.userId === userId)
  if (r) (r as CSRule & { _deleted?: boolean })._deleted = true
  return Promise.resolve()
}

export function getInsights(userId: string, days = 30): Promise<InsightMetric[]> {
  const list = insights.filter((i) => (i as InsightMetric & { userId?: string }).userId === userId)
  return Promise.resolve([...list].sort((a, b) => b.date.localeCompare(a.date)).slice(0, days))
}

export function saveInsight(userId: string, data: InsightMetric): Promise<void> {
  const existing = insights.findIndex((i) => (i as InsightMetric & { userId?: string }).userId === userId && i.date === data.date)
  const row = { ...data, userId } as InsightMetric & { userId: string }
  if (existing >= 0) insights[existing] = row
  else insights.push(row)
  return Promise.resolve()
}

export function getInsightPosts(userId: string): Promise<{ id: string; title: string; type: string; publishedAt: number; views: number; likes: number; comments: number }[]> {
  const list = insightPosts.filter((p) => (p as { userId?: string }).userId === userId)
  return Promise.resolve([...list].sort((a, b) => b.publishedAt - a.publishedAt).slice(0, 20))
}
