import api from './index'
import { useMock } from './mockSwitch'
import type { Badge, EarnedBadge } from '../types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockBadges: Badge[] = [
  {
    id: 'badge-001',
    type: 'FIRST_COURSE',
    name: '入门学员',
    description: '完成第一门课程',
    iconUrl: 'https://via.placeholder.com/64?text=Badge1',
    criteria: '完成第一门课程'
  },
  {
    id: 'badge-002',
    type: 'STREAK_7',
    name: '连续学习7天',
    description: '连续7天学习',
    iconUrl: 'https://via.placeholder.com/64?text=Badge2',
    criteria: '连续7天学习'
  },
  {
    id: 'badge-003',
    type: 'PERFECT_SCORE',
    name: '满分学员',
    description: '获得一次满分',
    iconUrl: 'https://via.placeholder.com/64?text=Badge3',
    criteria: '获得一次满分'
  },
  {
    id: 'badge-004',
    type: 'CHAPTER_MASTER',
    name: '章节大师',
    description: '完成10个章节',
    iconUrl: 'https://via.placeholder.com/64?text=Badge4',
    criteria: '完成10个章节'
  }
]

const mockEarnedBadges: EarnedBadge[] = [
  {
    id: 'earned-001',
    childId: 'child-001',
    type: 'FIRST_COURSE',
    earnedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'earned-002',
    childId: 'child-001',
    type: 'STREAK_7',
    earnedAt: '2024-01-10T08:00:00Z'
  }
]

// GET /api/v1/badges - Get all available badges
export const getAllBadges = () => {
  if (useMock) {
    return delay(300).then(() => ({ data: mockBadges }))
  }
  return api.get<Badge[]>('/badges')
}

// GET /api/v1/badges/my - Get child's earned badges
export const getMyBadges = (childId: string) => {
  if (useMock) {
    const myBadges = mockEarnedBadges.filter(b => b.childId === childId)
    const result = myBadges.map(eb => {
      const badge = mockBadges.find(b => b.type === eb.type)
      return {
        ...eb,
        name: badge?.name,
        description: badge?.description,
        iconUrl: badge?.iconUrl,
        criteria: badge?.criteria
      }
    })
    return delay(300).then(() => ({ data: result }))
  }
  return api.get<EarnedBadge[]>(`/badges/${childId}/my`)
}

// POST /api/v1/badges/earn/:type - Earn a badge
export const earnBadge = (childId: string, badgeType: string) => {
  if (useMock) {
    return delay(400).then(() => ({
      data: {
        id: `earned-${Date.now()}`,
        childId,
        type: badgeType,
        earnedAt: new Date().toISOString()
      }
    }))
  }
  return api.post<EarnedBadge>(`/badges/earn/${badgeType}`, { childId })
}
