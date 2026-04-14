// Mock data for course module
import type { Course, Chapter, Enrollment, VideoSource } from '../../types'

export const mockTeachers: Record<string, { id: string; name: string; bio: string; avatarUrl: string; specialties: string[] }> = {
  'course-001': {
    id: 'teacher-001',
    name: '张老师',
    bio: '资深编程教育专家，具有10年教学经验',
    avatarUrl: 'https://via.placeholder.com/100x100?text=Teacher1',
    specialties: ['Scratch', 'Python', 'Web开发']
  },
  'course-002': {
    id: 'teacher-002',
    name: '李老师',
    bio: 'Python高级工程师，专注青少年编程教育',
    avatarUrl: 'https://via.placeholder.com/100x100?text=Teacher2',
    specialties: ['Python', '数据分析', 'AI入门']
  },
  'course-003': {
    id: 'teacher-003',
    name: '王老师',
    bio: '著名绘画老师，擅长儿童创意美术教育',
    avatarUrl: 'https://via.placeholder.com/100x100?text=Teacher3',
    specialties: ['绘画', '色彩搭配', '创意美术']
  }
}

export const mockCourses: Course[] = [
  {
    id: 'course-001',
    title: 'Scratch编程入门',
    description: '通过趣味项目学习编程基础，培养逻辑思维和创造力',
    coverImage: 'https://via.placeholder.com/300x200?text=Scratch',
    teacher: mockTeachers['course-001'],
    category: '编程',
    totalChapters: 8,
    totalDuration: 3600,
    price: 0,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'course-002',
    title: 'Python基础',
    description: '从零开始学习Python编程，掌握基本语法和常用库',
    coverImage: 'https://via.placeholder.com/300x200?text=Python',
    teacher: mockTeachers['course-002'],
    category: '编程',
    totalChapters: 12,
    totalDuration: 7200,
    price: 299,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'course-003',
    title: '创意绘画',
    description: '激发想象力，学习绘画技巧和色彩搭配',
    coverImage: 'https://via.placeholder.com/300x200?text=Drawing',
    teacher: mockTeachers['course-003'],
    category: '艺术',
    totalChapters: 6,
    totalDuration: 2400,
    price: 199,
    createdAt: '2024-02-01T00:00:00Z'
  }
]

export const mockChapters: Record<string, Chapter[]> = {
  'course-001': [
    { id: 'ch-001-1', courseId: 'course-001', title: '认识Scratch', sequence: 1, duration: 400, hasAssessment: true, videoId: 'video-001' },
    { id: 'ch-001-2', courseId: 'course-001', title: '角色和背景', sequence: 2, duration: 450, hasAssessment: true, videoId: 'video-002' },
    { id: 'ch-001-3', courseId: 'course-001', title: '运动和外观', sequence: 3, duration: 500, hasAssessment: false, videoId: 'video-003' },
    { id: 'ch-001-4', courseId: 'course-001', title: '声音和动画', sequence: 4, duration: 480, hasAssessment: false, videoId: 'video-004' },
    { id: 'ch-001-5', courseId: 'course-001', title: '事件和控制', sequence: 5, duration: 520, hasAssessment: false, videoId: 'video-005' },
    { id: 'ch-001-6', courseId: 'course-001', title: '变量和数据', sequence: 6, duration: 490, hasAssessment: false, videoId: 'video-006' },
    { id: 'ch-001-7', courseId: 'course-001', title: '广播和消息', sequence: 7, duration: 460, hasAssessment: false, videoId: 'video-007' },
    { id: 'ch-001-8', courseId: 'course-001', title: '创作你的游戏', sequence: 8, duration: 600, hasAssessment: false, videoId: 'video-008' }
  ],
  'course-002': [
    { id: 'ch-002-1', courseId: 'course-002', title: 'Python安装和运行', sequence: 1, duration: 300, hasAssessment: true, videoId: 'video-010' },
    { id: 'ch-002-2', courseId: 'course-002', title: '变量和数据类型', sequence: 2, duration: 600, hasAssessment: false, videoId: 'video-011' },
    { id: 'ch-002-3', courseId: 'course-002', title: '条件判断', sequence: 3, duration: 550, hasAssessment: false, videoId: 'video-012' }
  ]
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Backend returns Course[] directly
export const mockGetCourses = async (): Promise<Course[]> => {
  await delay(500)
  return mockCourses
}

// Backend returns nested structure with teacher object and chapters directly
export const mockGetCourseById = async (courseId: string) => {
  await delay(400)
  const course = mockCourses.find(c => c.id === courseId)
  const teacher = mockTeachers[courseId]
  if (!course || !teacher) throw new Error('Course not found')
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    coverImage: course.coverImage,
    teacher,
    category: course.category,
    totalChapters: course.totalChapters,
    totalDuration: course.totalDuration,
    price: course.price,
    createdAt: course.createdAt,
    chapters: mockChapters[courseId] || []
  }
}

// Backend returns VideoPlayDto directly
export const mockGetVideoPlay = async (videoId: string) => {
  await delay(300)
  return {
    videoId,
    source: 'BILIBILI' as VideoSource,
    type: 'video',
    embedUrl: `https://www.bilibili.com/video/${videoId}`,
    title: '视频课程',
    thumbnailUrl: `https://via.placeholder.com/320x180?text=Video+${videoId}`,
    duration: 600
  }
}

// Backend returns Enrollment directly with message field
export const mockEnrollCourse = async (courseId: string) => {
  await delay(400)
  return {
    id: `enrollment-${Date.now()}`,
    childId: 'child-001',
    courseId,
    enrolledAt: new Date().toISOString(),
    completedChapters: 0,
    totalChapters: mockCourses.find(c => c.id === courseId)?.totalChapters || 0
  }
}

// Backend returns Enrollment[] directly
export const mockGetMyEnrollments = async (): Promise<Enrollment[]> => {
  await delay(400)
  return [
    {
      id: 'enrollment-001',
      childId: 'child-001',
      courseId: 'course-001',
      enrolledAt: '2024-01-15T00:00:00Z',
      completedChapters: 3,
      totalChapters: 8
    }
  ]
}
