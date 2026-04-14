import api from './index'
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
}) =>
  api.post<ChapterProgress>('/learning/progress', data)

// Get chapter progress for a course - backend returns ChapterProgress[] directly
export const getCourseProgress = (courseId: string) =>
  api.get<ChapterProgress[]>(`/learning/courses/${courseId}/progress`)

// Complete chapter - backend returns ChapterProgress directly
export const completeChapter = (data: { chapterId: string; courseId: string }) =>
  api.post<ChapterProgress>('/learning/complete-chapter', data)

// Get assessment questions for chapter - backend returns AssessmentQuestion[] directly
export const getAssessmentQuestions = (chapterId: string) =>
  api.get<AssessmentQuestion[]>(`/assessments/chapter/${chapterId}`)

// Submit assessment - backend returns AssessmentResult directly
export const submitAssessment = (assessmentId: string, childId: string, data: {
  answers: Record<string, string | string[]>
}) =>
  api.post<AssessmentResult>(`/assessments/${assessmentId}/submit`, { childId, ...data })

// Get assessment history - backend returns AssessmentResult[] directly
export const getAssessmentHistory = () =>
  api.get<AssessmentResult[]>('/assessments/history')
