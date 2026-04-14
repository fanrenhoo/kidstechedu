// Mock data for learning module
import type { ChapterProgress, AssessmentQuestion, AssessmentResult } from '../../types'

export const mockChapterProgress: Record<string, ChapterProgress> = {
  'ch-001-1': {
    chapterId: 'ch-001-1',
    courseId: 'course-001',
    childId: 'child-001',
    watchProgress: 100,
    isCompleted: true,
    lastWatchedAt: new Date().toISOString()
  },
  'ch-001-2': {
    chapterId: 'ch-001-2',
    courseId: 'course-001',
    childId: 'child-001',
    watchProgress: 60,
    isCompleted: false,
    lastWatchedAt: new Date().toISOString()
  }
}

export const mockAssessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'q-001',
    chapterId: 'ch-001-1',
    question: 'Scratch是一种什么类型的编程工具？',
    options: [
      '文字编程语言',
      '图形化编程工具',
      '硬件编程工具',
      '网页编程工具'
    ],
    correctAnswer: 1,
    questionType: 'single_choice',
    explanation: 'Scratch是由麻省理工学院开发的图形化编程工具，适合初学者入门'
  },
  {
    id: 'q-002',
    chapterId: 'ch-001-1',
    question: '以下哪些是Scratch中可以添加的角色来源？',
    options: [
      'Scratch自带角色库',
      '自己绘制',
      '上传图片',
      '以上全部'
    ],
    correctAnswer: 3,
    questionType: 'single_choice',
    explanation: 'Scratch支持从角色库选择，手绘创作和上传图片三种方式添加角色'
  },
  {
    id: 'q-003',
    chapterId: 'ch-001-1',
    question: 'Scratch中的"绿旗"按钮有什么作用？',
    options: [
      '停止程序',
      '运行程序',
      '删除角色',
      '保存项目'
    ],
    correctAnswer: 1,
    questionType: 'single_choice',
    explanation: '绿旗按钮用于启动程序运行，点击后程序开始执行'
  }
]

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Backend returns ChapterProgress directly
export const mockReportProgress = async (data: {
  chapterId: string
  watchedSeconds: number
  duration: number
}): Promise<ChapterProgress> => {
  await delay(300)
  const progress = Math.round((data.watchedSeconds / data.duration) * 100)
  const chapterProgress: ChapterProgress = {
    chapterId: data.chapterId,
    courseId: 'course-001', // mock - would come from chapter association
    childId: 'child-001',
    watchProgress: progress,
    isCompleted: progress >= 90,
    lastWatchedAt: new Date().toISOString()
  }
  mockChapterProgress[data.chapterId] = chapterProgress
  return chapterProgress
}

// Backend returns ChapterProgress[] directly
export const mockGetCourseProgress = async (courseId: string): Promise<ChapterProgress[]> => {
  await delay(400)
  return Object.values(mockChapterProgress).filter(p => p.courseId === courseId)
}

// Backend returns ChapterProgress directly
export const mockCompleteChapter = async (data: { chapterId: string; courseId: string }): Promise<ChapterProgress> => {
  await delay(300)
  const chapterProgress: ChapterProgress = {
    chapterId: data.chapterId,
    courseId: data.courseId,
    childId: 'child-001',
    watchProgress: 100,
    isCompleted: true,
    lastWatchedAt: new Date().toISOString()
  }
  mockChapterProgress[data.chapterId] = chapterProgress
  return chapterProgress
}

// Backend returns AssessmentQuestion[] directly
export const mockGetAssessmentQuestions = async (chapterId: string): Promise<AssessmentQuestion[]> => {
  await delay(400)
  return mockAssessmentQuestions.filter(q => q.chapterId === chapterId)
}

// Backend: POST /assessments/:id/submit with { childId, answers }
// Returns AssessmentResult directly
export const mockSubmitAssessment = async (assessmentId: string, childId: string, data: {
  answers: Record<string, string | string[]>
}): Promise<AssessmentResult> => {
  await delay(600)
  // Simple scoring logic
  const questions = mockAssessmentQuestions.filter(q => q.chapterId === assessmentId.split('-')[0])
  let correctCount = 0
  for (const q of questions) {
    const answer = data.answers[q.id]
    if (answer !== undefined) {
      const userAnswer = Array.isArray(answer) ? answer[0] : answer
      if (String(userAnswer) === String(q.correctAnswer)) {
        correctCount++
      }
    }
  }
  const score = Math.round((correctCount / questions.length) * 100)
  return {
    id: `result-${Date.now()}`,
    childId,
    chapterId: assessmentId,
    score,
    passed: score >= 60,
    submittedAt: new Date().toISOString(),
    answers: Object.values(data.answers)
  }
}

// Backend returns AssessmentResult[] directly
export const mockGetAssessmentHistory = async (): Promise<AssessmentResult[]> => {
  await delay(400)
  return [
    {
      id: 'result-001',
      childId: 'child-001',
      chapterId: 'ch-001-1',
      score: 85,
      passed: true,
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      answers: ['1', '3', '1']
    }
  ]
}
