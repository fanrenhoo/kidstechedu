// Mock data for guardian module
import type { GuardianSetting, GuardianStatus, GuardianHistory, CourseProgress, TimeSlot } from '../../types'

export const mockGuardianSettings: GuardianSetting = {
  id: 'gs-001',
  childId: 'child-001',
  dailyLimitMins: 60,
  timeSlots: [
    { start: '09:00', end: '21:00', days: [] }
  ],
  isActive: true
}

// GuardianStatus per backend: { isOnline, currentCourse, currentSession, todayTotalMins, dailyLimitMins, remainingMins }
export const mockGuardianStatus: GuardianStatus = {
  isOnline: true,
  currentCourse: {
    id: 'course-001',
    title: 'Scratch编程入门'
  },
  currentSession: {
    startTime: new Date(Date.now() - 1800000).toISOString(),
    watchedMins: 30
  },
  todayTotalMins: 45,
  dailyLimitMins: 60,
  remainingMins: 15
}

export const mockGuardianStatusOffline: GuardianStatus = {
  isOnline: false,
  currentCourse: null,
  currentSession: null,
  todayTotalMins: 0,
  dailyLimitMins: 60,
  remainingMins: 60
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Backend returns GuardianSetting directly
export const mockGetGuardianSettings = async (childId: string): Promise<GuardianSetting> => {
  await delay(300)
  return { ...mockGuardianSettings, childId }
}

// Backend returns GuardianSetting directly
export const mockUpdateGuardianSettings = async (data: {
  childId: string
  dailyLimitMins?: number
  timeSlots?: TimeSlot[]
  isActive?: boolean
}): Promise<GuardianSetting> => {
  await delay(400)
  return {
    ...mockGuardianSettings,
    childId: data.childId,
    dailyLimitMins: data.dailyLimitMins ?? mockGuardianSettings.dailyLimitMins,
    timeSlots: data.timeSlots ?? mockGuardianSettings.timeSlots,
    isActive: data.isActive ?? mockGuardianSettings.isActive
  }
}

// Backend returns { allowed, remainingMins, reason } directly
export const mockCheckTimeLimit = async (_childId: string) => {
  await delay(200)
  return {
    allowed: true,
    remainingMins: 15,
    reason: undefined
  }
}

// Backend returns GuardianStatus directly
export const mockGetCurrentStatus = async (_childId: string, online = true): Promise<GuardianStatus> => {
  await delay(300)
  return online ? { ...mockGuardianStatus } : { ...mockGuardianStatusOffline }
}

// Backend returns GuardianHistory[] directly
export const mockGetHistory = async (_childId: string): Promise<GuardianHistory[]> => {
  await delay(400)
  return [
    {
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      totalDurationMins: 55,
      sessions: [
        {
          id: 'session-001',
          childId: 'child-001',
          courseId: 'course-001',
          chapterId: 'ch-001-2',
          startTime: new Date(Date.now() - 7200000).toISOString(),
          durationMins: 30,
          status: 'ended'
        },
        {
          id: 'session-002',
          childId: 'child-001',
          courseId: 'course-001',
          chapterId: 'ch-001-3',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          durationMins: 25,
          status: 'ended'
        }
      ]
    }
  ]
}

// Backend returns CourseProgress[] directly
export const mockGetCourseProgressList = async (_childId: string): Promise<CourseProgress[]> => {
  await delay(400)
  return [
    {
      courseId: 'course-001',
      courseTitle: 'Scratch编程入门',
      completedChapters: 3,
      totalChapters: 8,
      enrollmentDate: '2024-01-15T00:00:00Z'
    }
  ]
}

// Backend returns { sessionId } directly
export const mockStartSession = async (_data: { childId: string; courseId: string; chapterId: string }) => {
  await delay(300)
  return { sessionId: `session-${Date.now()}` }
}

// Backend returns { durationMins } directly
export const mockReportHeartbeat = async (_childId: string) => {
  await delay(100)
  return { durationMins: 1 }
}

// Backend returns { totalDurationMins } directly
export const mockEndSession = async (_childId: string) => {
  await delay(200)
  return { totalDurationMins: 30 }
}
