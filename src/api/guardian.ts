import api from './index'
import { useMock } from './mockSwitch'
import * as mockGuardian from './mock/guardian'
import type {
  GuardianSetting,
  GuardianStatus,
  GuardianHistory,
  CourseProgress,
  TimeSlot
} from '../types'

// Get guardian settings - backend returns GuardianSetting directly
export const getGuardianSettings = (childId: string) => {
  if (useMock) {
    return mockGuardian.mockGetGuardianSettings(childId).then(data => ({ data }))
  }
  return api.get<GuardianSetting>(`/guardian/parental/control/${childId}/settings`)
}

// Update guardian settings - backend returns GuardianSetting directly
export const updateGuardianSettings = (data: {
  childId: string
  dailyLimitMins?: number
  timeSlots?: TimeSlot[]
  isActive?: boolean
}) => {
  if (useMock) {
    return mockGuardian.mockUpdateGuardianSettings(data).then(data => ({ data }))
  }
  return api.put<GuardianSetting>(`/guardian/parental/control/${data.childId}/settings`, {
    dailyLimitMins: data.dailyLimitMins,
    timeSlots: data.timeSlots,
    isActive: data.isActive
  })
}

// Check time limit - backend returns { allowed, remainingMins, reason } directly
export const checkTimeLimit = (childId: string) => {
  if (useMock) {
    return mockGuardian.mockCheckTimeLimit(childId).then(data => ({ data }))
  }
  return api.get<{ allowed: boolean; remainingMins: number; reason?: string }>(`/guardian/parental/control/${childId}/check-time`)
}

// Start learning session - backend returns { sessionId } directly
export const startSession = (data: { childId: string; courseId: string; chapterId: string }) => {
  if (useMock) {
    return mockGuardian.mockStartSession(data).then(data => ({ data }))
  }
  return api.post<{ sessionId: string }>(`/guardian/${data.childId}/session/start`, {
    courseId: data.courseId,
    chapterId: data.chapterId
  })
}

// Report heartbeat - backend returns { durationMins } directly
export const reportHeartbeat = (childId: string) => {
  if (useMock) {
    return mockGuardian.mockReportHeartbeat(childId).then(data => ({ data }))
  }
  return api.post<{ durationMins: number }>(`/guardian/${childId}/session/heartbeat`)
}

// End learning session - backend returns { totalDurationMins } directly
export const endSession = (childId: string) => {
  if (useMock) {
    return mockGuardian.mockEndSession(childId).then(data => ({ data }))
  }
  return api.post<{ totalDurationMins: number }>(`/guardian/${childId}/session/end`)
}

// Get current status - backend returns GuardianStatus directly
export const getCurrentStatus = (childId: string) => {
  if (useMock) {
    return mockGuardian.mockGetCurrentStatus(childId).then(data => ({ data }))
  }
  return api.get<GuardianStatus>(`/guardian/parental/monitor/${childId}/current`)
}

// Get history - backend returns GuardianHistory[] directly
export const getHistory = (childId: string, date?: string) => {
  if (useMock) {
    return mockGuardian.mockGetHistory(childId).then(data => ({ data }))
  }
  return api.get<GuardianHistory[]>(`/guardian/parental/monitor/${childId}/history`, {
    params: date ? { date } : {}
  })
}

// Get course progress list - backend returns CourseProgress[] directly
export const getCourseProgressList = (childId: string) => {
  if (useMock) {
    return mockGuardian.mockGetCourseProgressList(childId).then(data => ({ data }))
  }
  return api.get<CourseProgress[]>(`/guardian/parental/monitor/${childId}/course-progress`)
}
