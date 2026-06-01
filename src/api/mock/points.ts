// Mock data for points and badges module
import type { PointsBalance, PointsHistory, Badge } from '../../types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockPointsBalance: PointsBalance = {
  childId: 'child-001',
  balance: 1250,
  totalEarned: 2000,
  totalRedeemed: 750
}

export const mockPointsHistory: PointsHistory[] = [
  { id: 'ph-001', childId: 'child-001', type: 'earn', amount: 100, description: '完成章节学习', createdAt: '2024-01-15T10:00:00Z' },
  { id: 'ph-002', childId: 'child-001', type: 'earn', amount: 50, description: '每日签到', createdAt: '2024-01-14T09:00:00Z' },
  { id: 'ph-003', childId: 'child-001', type: 'redeem', amount: -200, description: '兑换勋章', createdAt: '2024-01-13T15:00:00Z' }
]

export const mockBadges: Badge[] = [
  { id: 'badge-001', type: 'FIRST_COURSE', name: '入门学员', description: '完成第一门课程', iconUrl: 'https://via.placeholder.com/64?text=Badge1', criteria: '完成第一门课程' },
  { id: 'badge-002', type: 'STREAK_7', name: '连续学习7天', description: '连续7天学习', iconUrl: 'https://via.placeholder.com/64?text=Badge2', criteria: '连续7天学习' },
  { id: 'badge-003', type: 'PERFECT_SCORE', name: '满分学员', description: '获得一次满分', iconUrl: 'https://via.placeholder.com/64?text=Badge3', criteria: '获得一次满分' },
  { id: 'badge-004', type: 'CHAPTER_MASTER', name: '章节大师', description: '完成10个章节', iconUrl: 'https://via.placeholder.com/64?text=Badge4', criteria: '完成10个章节' }
]

// Mock: get points balance
export const mockGetPointsBalance = async (childId: string) => {
  await delay(300)
  return { ...mockPointsBalance, childId }
}

// Mock: earn points
export const mockEarnPoints = async (childId: string, amount: number, description: string) => {
  await delay(300)
  return {
    id: `pe-${Date.now()}`,
    childId,
    type: 'earn' as const,
    amount,
    description,
    createdAt: new Date().toISOString()
  }
}

// Mock: redeem points
export const mockRedeemPoints = async (childId: string, amount: number, description: string) => {
  await delay(300)
  return {
    id: `pr-${Date.now()}`,
    childId,
    type: 'redeem' as const,
    amount: -amount,
    description,
    createdAt: new Date().toISOString()
  }
}

// Mock: get points history
export const mockGetPointsHistory = async (childId: string) => {
  await delay(400)
  return mockPointsHistory
}

// Mock: get all badges
export const mockGetAllBadges = async () => {
  await delay(300)
  return mockBadges
}

// Mock: get my badges
export const mockGetMyBadges = async (childId: string) => {
  await delay(300)
  return mockBadges.slice(0, 2)
}

// Mock: earn badge
export const mockEarnBadge = async (childId: string, badgeType: string) => {
  await delay(400)
  return {
    id: `eb-${Date.now()}`,
    childId,
    type: badgeType,
    earnedAt: new Date().toISOString()
  }
}
