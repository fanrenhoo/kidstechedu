import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChapterProgress, AssessmentQuestion, AssessmentResult } from '../types'
import * as learningApi from '../api/learning'

export const useLearningStore = defineStore('learning', () => {
  const chapterProgress = ref<Map<string, ChapterProgress>>(new Map())
  const assessmentQuestions = ref<AssessmentQuestion[]>([])
  const currentAssessmentId = ref<string | null>(null)
  const assessmentHistory = ref<AssessmentResult[]>([])
  const isLoading = ref(false)

  // Report progress (uses watchedSeconds and duration in seconds)
  // courseId is obtained from chapter association in real backend
  const reportProgress = async (data: {
    chapterId: string
    watchedSeconds: number
    duration: number
  }) => {
    const response = await learningApi.reportProgress(data)
    const progress = response.data
    chapterProgress.value.set(data.chapterId, progress)
    return progress
  }

  // Get chapter progress
  const fetchChapterProgress = async (chapterId: string) => {
    const response = await learningApi.getCourseProgress(chapterId)
    return response.data
  }

  // Get course progress (all chapters)
  const fetchCourseProgress = async (courseId: string) => {
    const response = await learningApi.getCourseProgress(courseId)
    return response.data
  }

  // Complete chapter
  const completeChapter = async (chapterId: string, courseId: string) => {
    const response = await learningApi.completeChapter({ chapterId, courseId })
    const progress = response.data
    chapterProgress.value.set(chapterId, progress)
    return progress
  }

  // Get assessment questions
  const fetchAssessmentQuestions = async (chapterId: string) => {
    isLoading.value = true
    try {
      const response = await learningApi.getAssessmentQuestions(chapterId)
      assessmentQuestions.value = response.data
      // Store the first question's ID as the assessment ID for submission
      // (backend may return multiple questions with same assessmentId)
      if (response.data.length > 0) {
        currentAssessmentId.value = response.data[0].id
      }
      return response.data
    } finally {
      isLoading.value = false
    }
  }

  // Submit assessment (uses currentAssessmentId stored from fetchAssessmentQuestions)
  const submitAssessment = async (childId: string, answers: Record<string, string | string[]>) => {
    if (!currentAssessmentId.value) {
      throw new Error('No assessment ID available. Please fetch questions first.')
    }
    const response = await learningApi.submitAssessment(currentAssessmentId.value, childId, { answers })
    return response.data
  }

  // Get assessment history
  const fetchAssessmentHistory = async () => {
    isLoading.value = true
    try {
      const response = await learningApi.getAssessmentHistory()
      assessmentHistory.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  // Get progress for a chapter
  const getChapterProgress = (chapterId: string) => {
    return chapterProgress.value.get(chapterId)
  }

  return {
    chapterProgress,
    assessmentQuestions,
    currentAssessmentId,
    assessmentHistory,
    isLoading,
    reportProgress,
    fetchChapterProgress,
    fetchCourseProgress,
    completeChapter,
    fetchAssessmentQuestions,
    submitAssessment,
    fetchAssessmentHistory,
    getChapterProgress
  }
})
