import api from './index'
import { useMock } from './mockSwitch'
import type { CourseResource, ResourceChannel, SyncLog } from '../types'

// Get all resource channels
export const getResourceChannels = () => {
  if (useMock) {
    return Promise.resolve({
      data: [
        {
          id: 'ch_douyin_01',
          platform: 'douyin',
          accountId: '72829129075',
          category: 'douyin',
          status: 'active',
          lastSyncAt: '2026-05-08T14:00:00Z'
        }
      ]
    })
  }
  return api.get<ResourceChannel[]>('/resource-channels')
}

// Get all course resources
export const getCourseResources = (params?: { category?: string }) => {
  if (useMock) {
    return Promise.resolve({ data: [] })
  }
  return api.get<CourseResource[]>('/course-resources', { params })
}

// Trigger sync for a channel
export const triggerSync = (channelId: string) => {
  if (useMock) {
    return Promise.resolve({ data: { success: true, message: '同步任务已触发' } })
  }
  return api.post<void>(`/resource-channels/${channelId}/sync`)
}

// Get sync logs
export const getSyncLogs = (channelId?: string) => {
  if (useMock) {
    return Promise.resolve({
      data: [
        {
          id: 'log_001',
          channelId: 'ch_douyin_01',
          status: 'success',
          syncedCount: 18,
          startedAt: '2026-05-08T14:00:00Z',
          completedAt: '2026-05-08T14:01:30Z'
        }
      ]
    })
  }
  return api.get<SyncLog[]>('/sync-logs', { params: { channelId } })
}