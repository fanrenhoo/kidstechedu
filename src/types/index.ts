// User types
export type UserType = 'parent' | 'child' | 'admin'

export interface User {
  id: string
  type: UserType
  email?: string
  createdAt: string
}

export interface ParentProfile {
  phone: string
  email: string
  name: string
}

export interface ChildProfile {
  nickname: string
  birthDate: string
  gender: string
  learningGoals: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  identifier: string
  password: string
}

export interface RegisterParentRequest {
  phone: string
  verifyCode: string
  email: string
  password: string
  name: string
}

export interface CreateChildRequest {
  birthDate: string
  gender: string
  learningGoals: {
    interests?: string[]
    target?: string
    customGoal?: string
  }
}

// Course types
export interface Course {
  id: string
  title: string
  description: string
  coverImage: string
  teacher: {
    id: string
    name: string
    bio: string
    avatarUrl: string
    specialties: string[]
  }
  category: string
  totalChapters: number
  totalDuration: number
  price: number
  createdAt: string
  chapters?: Chapter[] // chapters returned within course response
}

export interface Chapter {
  id: string
  courseId: string
  title: string
  sequence: number
  duration: number
  hasAssessment: boolean
  videoId?: string
}

export interface VideoPlay {
  videoId: string
  embedUrl: string
  source: VideoSource
}

// Video source enum - uppercase values to match backend
export type VideoSource = 'BILIBILI' | 'DOUYIN' | 'WECHAT_VIDEO' | 'XIAOHONGSHU' | 'SELF_UPLOAD'

// Learning types
export interface Enrollment {
  id: string
  childId: string
  courseId: string
  enrolledAt: string
  completedChapters: number
  totalChapters: number
}

export interface ChapterProgress {
  chapterId: string
  courseId: string
  childId: string
  watchProgress: number
  isCompleted: boolean
  lastWatchedAt: string
}

export interface LearningRecord {
  id: string
  childId: string
  courseId: string
  chapterId: string
  watchProgress: number
  durationMins: number
  recordedAt: string
}

// Assessment types
export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false'

export interface AssessmentQuestion {
  id: string
  chapterId: string
  question: string
  options: string[]
  correctAnswer: number | number[]
  questionType: QuestionType
  explanation?: string
}

export interface AssessmentResult {
  id: string
  childId: string
  chapterId: string
  score: number
  passed: boolean
  submittedAt: string
  answers: (string | string[])[]
}

// Guardian types
export interface GuardianSetting {
  id: string
  childId: string
  dailyLimitMins: number // minutes per day
  timeSlots: TimeSlot[]
  isActive: boolean
}

export interface TimeSlot {
  start: string // "HH:mm" format, e.g. "09:00"
  end: string   // "HH:mm" format, e.g. "21:00"
  days: string[] // weekday array, e.g. ["Mon","Tue"], empty = every day
}

export interface LearningSession {
  id: string
  childId: string
  courseId: string
  chapterId: string
  startTime: string
  durationMins: number
  status: 'active' | 'paused' | 'ended'
}

export interface GuardianStatus {
  isOnline: boolean
  currentCourse: {
    id: string
    title: string
  } | null
  currentSession: {
    startTime: string
    watchedMins: number
  } | null
  todayTotalMins: number
  dailyLimitMins: number
  remainingMins: number
}

export interface GuardianHistory {
  date: string
  totalDurationMins: number
  sessions: LearningSession[]
}

export interface CourseProgress {
  courseId: string
  courseTitle: string
  completedChapters: number
  totalChapters: number
  enrollmentDate: string
}

// Points types
export interface PointsBalance {
  childId: string
  balance: number
  totalEarned: number
  totalRedeemed: number
}

export interface PointsHistory {
  id: string
  childId: string
  type: 'earn' | 'redeem'
  amount: number
  description: string
  createdAt: string
}

export interface PointsEarn {
  childId: string
  amount: number
  description: string
}

export interface PointsRedeem {
  childId: string
  amount: number
  description: string
}

// Badge types
export interface Badge {
  id: string
  type: string
  name: string
  description: string
  iconUrl: string
  criteria: string
}

export interface EarnedBadge {
  id: string
  childId: string
  type: string
  earnedAt: string
}

// Resource Channel types
export interface ResourceChannel {
  id: string
  platform: 'douyin' | 'bilibili' | 'other'
  accountId: string
  category: string
  status: 'pending' | 'active' | 'synced'
  lastSyncAt?: string
  createdAt: string
}

export interface CourseResource {
  id: string
  channelId?: string
  sourceType: 'builtin' | 'admin' | 'aggregated'
  sourceId: string
  title: string
  description?: string
  coverUrl?: string
  contentUrl: string
  category: 'AI' | '逻辑思维' | '科学' | '历史' | '其它'
  visibleTo: ('admin' | 'parent' | 'child')[]
  createdAt: string
  syncedAt?: string
}

export interface SyncLog {
  id: string
  channelId: string
  status: 'running' | 'success' | 'failed'
  syncedCount: number
  errorMessage?: string
  startedAt: string
  completedAt?: string
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T
  message: string
}

export interface ApiError {
  error: {
    code: string
    message: string
  }
}
