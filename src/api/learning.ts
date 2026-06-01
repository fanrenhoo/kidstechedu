import api from './index'
import { useMock } from './mockSwitch'
import * as mockLearning from './mock/learning'
import type {
  ChapterProgress,
  AssessmentQuestion,
  AssessmentResult
} from '../types'

// Report learning progress - backend returns ChapterProgress directly
// courseId is obtained from chapter association in real backend
export const reportProgress = (data: {
  chapterId: string
  watchedSeconds: number
  duration: number
}) => {
  if (useMock) {
    return mockLearning.mockReportProgress(data).then(data => ({ data }))
  }
  return api.post<ChapterProgress>('/learning/progress', data)
}

// Get chapter progress for a course - backend returns ChapterProgress[] directly
export const getCourseProgress = (courseId: string) => {
  if (useMock) {
    return mockLearning.mockGetCourseProgress(courseId).then(data => ({ data }))
  }
  return api.get<ChapterProgress[]>(`/learning/courses/${courseId}/progress`)
}

// Complete chapter - backend returns ChapterProgress directly
export const completeChapter = (data: { chapterId: string; courseId: string }) => {
  if (useMock) {
    return mockLearning.mockCompleteChapter(data).then(data => ({ data }))
  }
  return api.post<ChapterProgress>('/learning/complete-chapter', data)
}

// Get assessment questions for chapter - backend returns AssessmentQuestion[] directly
export const getAssessmentQuestions = (chapterId: string) => {
  if (useMock) {
    return mockLearning.mockGetAssessmentQuestions(chapterId).then(data => ({ data }))
  }
  return api.get<AssessmentQuestion[]>(`/assessments/chapter/${chapterId}`)
}

// Submit assessment - backend returns AssessmentResult directly
export const submitAssessment = (assessmentId: string, childId: string, data: {
  answers: Record<string, string | string[]>
}) => {
  if (useMock) {
    return mockLearning.mockSubmitAssessment(assessmentId, childId, data).then(data => ({ data }))
  }
  return api.post<AssessmentResult>(`/assessments/${assessmentId}/submit`, { childId, ...data })
}

// Get assessment history - backend returns AssessmentResult[] directly
export const getAssessmentHistory = () => {
  if (useMock) {
    return mockLearning.mockGetAssessmentHistory().then(data => ({ data }))
  }
  return api.get<AssessmentResult[]>('/assessments/history')
}
