import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  GuardianSetting,
  GuardianStatus,
  GuardianHistory,
  CourseProgress,
  TimeSlot
} from '../types'
import * as guardianApi from '../api/guardian'

export const useGuardianStore = defineStore('guardian', () => {
  const guardianSettings = ref<Map<string, GuardianSetting>>(new Map())
  const currentStatus = ref<GuardianStatus | null>(null)
  const history = ref<GuardianHistory[]>([])
  const courseProgressList = ref<CourseProgress[]>([])
  const isLoading = ref(false)
  const pollInterval = ref<number | null>(null)

  // Get guardian settings for a child
  const fetchGuardianSettings = async (childId: string) => {
    const response = await guardianApi.getGuardianSettings(childId)
    guardianSettings.value.set(childId, response.data)
    return response.data
  }

  // Update guardian settings
  const updateGuardianSettings = async (data: {
    childId: string
    dailyLimitMins?: number
    timeSlots?: TimeSlot[]
    isActive?: boolean
  }) => {
    const response = await guardianApi.updateGuardianSettings(data)
    guardianSettings.value.set(data.childId, response.data)
    return response.data
  }

  // Check time limit before starting session
  const checkTimeLimit = async (childId: string) => {
    const response = await guardianApi.checkTimeLimit(childId)
    return response.data
  }

  // Start learning session
  const startSession = async (childId: string, courseId: string, chapterId: string) => {
    const response = await guardianApi.startSession({ childId, courseId, chapterId })
    return response.data
  }

  // Report heartbeat
  const reportHeartbeat = async (childId: string) => {
    const response = await guardianApi.reportHeartbeat(childId)
    return response.data
  }

  // End session
  const endSession = async (childId: string) => {
    const response = await guardianApi.endSession(childId)
    return response.data
  }

  // Get current status (live monitoring) - supports polling
  const fetchCurrentStatus = async (childId: string) => {
    const response = await guardianApi.getCurrentStatus(childId)
    currentStatus.value = response.data
    return response.data
  }

  // Start polling for live status (call this when entering monitoring page)
  const startStatusPolling = (childId: string, intervalMs = 30000) => {
    stopStatusPolling() // Clear any existing polling
    fetchCurrentStatus(childId) // Fetch immediately
    pollInterval.value = window.setInterval(() => {
      fetchCurrentStatus(childId)
    }, intervalMs)
  }

  // Stop polling
  const stopStatusPolling = () => {
    if (pollInterval.value !== null) {
      clearInterval(pollInterval.value)
      pollInterval.value = null
    }
  }

  // Get history
  const fetchHistory = async (childId: string, date?: string) => {
    isLoading.value = true
    try {
      const response = await guardianApi.getHistory(childId, date)
      history.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  // Get course progress list
  const fetchCourseProgressList = async (childId: string) => {
    isLoading.value = true
    try {
      const response = await guardianApi.getCourseProgressList(childId)
      courseProgressList.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  return {
    guardianSettings,
    currentStatus,
    history,
    courseProgressList,
    isLoading,
    fetchGuardianSettings,
    updateGuardianSettings,
    checkTimeLimit,
    startSession,
    reportHeartbeat,
    endSession,
    fetchCurrentStatus,
    startStatusPolling,
    stopStatusPolling,
    fetchHistory,
    fetchCourseProgressList
  }
})
