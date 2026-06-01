import api from './index'
import { useMock } from './mockSwitch'
import * as mockPoints from './mock/points'
import type { PointsBalance, PointsHistory, PointsEarn, PointsRedeem, Badge } from '../types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock data
const mockPointsBalance: PointsBalance = {
  childId: 'child-001',
  balance: 1250,
  totalEarned: 2000,
  totalRedeemed: 750
}

const mockPointsHistory: PointsHistory[] = [
  { id: 'ph-001', childId: 'child-001', type: 'earn', amount: 100, description: '完成章节学习', createdAt: '2024-01-15T10:00:00Z' },
  { id: 'ph-002', childId: 'child-001', type: 'earn', amount: 50, description: '每日签到', createdAt: '2024-01-14T09:00:00Z' },
  { id: 'ph-003', childId: 'child-001', type: 'redeem', amount: -200, description: '兑换勋章', createdAt: '2024-01-13T15:00:00Z' }
]

// GET /api/v1/points/balance
export const getPointsBalance = (childId: string) => {
  if (useMock) {
    return Promise.resolve({ data: { ...mockPointsBalance, childId } })
  }
  return api.get<PointsBalance>(`/points/${childId}/balance`)
}

// POST /api/v1/points/earn
export const earnPoints = (data: PointsEarn) => {
  if (useMock) {
    return delay(300).then(() => ({
      data: {
        id: `pe-${Date.now()}`,
        childId: data.childId,
        type: 'earn' as const,
        amount: data.amount,
        description: data.description,
        createdAt: new Date().toISOString()
      }
    }))
  }
  return api.post<PointsHistory>('/points/earn', data)
}

// POST /api/v1/points/redeem
export const redeemPoints = (data: PointsRedeem) => {
  if (useMock) {
    return delay(300).then(() => ({
      data: {
        id: `pr-${Date.now()}`,
        childId: data.childId,
        type: 'redeem' as const,
        amount: -data.amount,
        description: data.description,
        createdAt: new Date().toISOString()
      }
    }))
  }
  return api.post<PointsHistory>('/points/redeem', data)
}

// GET /api/v1/badges
export const getAllBadges = () => {
  if (useMock) {
    return mockPoints.mockGetAllBadges().then(data => ({ data }))
  }
  return api.get<Badge[]>('/badges')
}

// GET /api/v1/badges/my
export const getMyBadges = (childId: string) => {
  if (useMock) {
    return mockPoints.mockGetMyBadges(childId).then(data => ({ data }))
  }
  return api.get<Badge[]>(`/badges/${childId}/my`)
}

// POST /api/v1/badges/earn/:type
export const earnBadge = (childId: string, badgeType: string) => {
  if (useMock) {
    return mockPoints.mockEarnBadge(childId, badgeType).then(data => ({ data }))
  }
  return api.post<{ id: string; childId: string; type: string; earnedAt: string }>(`/badges/earn/${badgeType}`, { childId })
}
