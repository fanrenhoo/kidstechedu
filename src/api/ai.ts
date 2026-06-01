import api from './index'
import { useMock } from './mockSwitch'
import * as mockAi from './mock/ai'

// Types for AI conversations
export interface AiConversation {
  id: string
  childId: string
  courseId?: string
  question: string
  answer: string
  category: 'AI' | '逻辑思维' | '科学' | '历史' | '其它'
  createdAt: string
  answeredAt?: string
}

export interface AiSummary {
  id: string
  childId: string
  period: string
  summary: string
  nextRecommendations: string[]
  createdAt: string
}

// Ask AI question - calls MiniMax API
export const askAi = (data: { question: string; category?: string; courseId?: string }) => {
  if (useMock) {
    return mockAi.mockAskAi(data).then(result => ({ data: result }))
  }
  return api.post<AiConversation>('/ai/ask', data)
}

// Get conversation history for child
export const getConversations = (childId: string, page = 1, pageSize = 20) => {
  if (useMock) {
    return mockAi.mockGetConversations(childId).then(data => ({ data: { items: data, pagination: { page, pageSize, total: data.length, totalPages: 1 } } }))
  }
  return api.get<{ items: AiConversation[]; pagination: any }>(`/ai/conversations/${childId}?page=${page}&pageSize=${pageSize}`)
}

// Get learning summary for child
export const getSummary = (childId: string) => {
  if (useMock) {
    return mockAi.mockGetSummary(childId).then(data => ({ data }))
  }
  return api.get<AiSummary>(`/ai/summary/${childId}`)
}

// Generate learning summary
export const generateSummary = (childId: string) => {
  if (useMock) {
    return mockAi.mockGenerateSummary(childId).then(data => ({ data }))
  }
  return api.post<AiSummary>('/ai/summary/generate', { childId })
}

// Get course categories
export const getCategories = () => {
  if (useMock) {
    return mockAi.mockGetCategories().then(data => ({ data }))
  }
  return api.get<{ id: string; name: string; icon: string }[]>('/ai/categories')
}