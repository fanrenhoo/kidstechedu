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
    bio: 'Python高级工程师，专注青少年编程教学',
    avatarUrl: 'https://via.placeholder.com/100x100?text=Teacher2',
    specialties: ['Python', '数据分析', 'AI入门']
  },
  'course-003': {
    id: 'teacher-003',
    name: '王老师',
    bio: '著名绘画老师，擅长儿童创意美术教学',
    avatarUrl: 'https://via.placeholder.com/100x100?text=Teacher3',
    specialties: ['绘画', '色彩搭配', '创意美术']
  },
  'course-004': {
    id: 'teacher-004',
    name: '刘老师',
    bio: 'AI教育专家，熟悉机器学习和深度学习',
    avatarUrl: 'https://via.placeholder.com/100x100?text=Teacher4',
    specialties: ['AI', '机器学习', 'TensorFlow']
  },
  'course-005': {
    id: 'teacher-005',
    name: '陈老师',
    bio: '著名历史学者，擅长儿童历史教育',
    avatarUrl: 'https://via.placeholder.com/100x100?text=Teacher5',
    specialties: ['历史', '文化', '考古']
  }
}

export const mockCourses: Course[] = [
  {
    id: 'course-001',
    title: 'Scratch编程入门',
    description: '通过趣味项目学习编程基础，培养逻辑思维和创造力',
    coverImage: 'https://via.placeholder.com/300x200?text=Scratch',
    teacher: mockTeachers['course-001'],
    category: '逻辑思维',
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
    category: 'AI',
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
    category: '其它',
    totalChapters: 6,
    totalDuration: 2400,
    price: 199,
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'course-004',
    title: 'AI与机器学习入门',
    description: '了解人工智能 basics，探索机器学习的奥秘',
    coverImage: 'https://via.placeholder.com/300x200?text=AI',
    teacher: mockTeachers['course-004'],
    category: 'AI',
    totalChapters: 10,
    totalDuration: 5400,
    price: 399,
    createdAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'course-005',
    title: '中国古代历史故事',
    description: '通过有趣的故事了解中国历史文化',
    coverImage: 'https://via.placeholder.com/300x200?text=History',
    teacher: mockTeachers['course-005'],
    category: '历史',
    totalChapters: 15,
    totalDuration: 4800,
    price: 299,
    createdAt: '2024-03-01T00:00:00Z'
  },
  {
    id: 'course-006',
    title: '趣味数学思维',
    description: '培养数学思维，通过游戏学习逻辑推理',
    coverImage: 'https://via.placeholder.com/300x200?text=Math',
    teacher: mockTeachers['course-001'],
    category: '逻辑思维',
    totalChapters: 8,
    totalDuration: 3200,
    price: 0,
    createdAt: '2024-03-10T00:00:00Z'
  },
  {
    id: 'course-007',
    title: '科学实验课',
    description: '动手做实验，探索物理化学的奇妙世界',
    coverImage: 'https://via.placeholder.com/300x200?text=Science',
    teacher: mockTeachers['course-002'],
    category: '科学',
    totalChapters: 12,
    totalDuration: 6000,
    price: 349,
    createdAt: '2024-03-15T00:00:00Z'
  },
  {
    id: 'course-008',
    title: '世界历史探索',
    description: '了解世界各地的历史文明和文化遗产',
    coverImage: 'https://via.placeholder.com/300x200?text=WorldHistory',
    teacher: mockTeachers['course-005'],
    category: '历史',
    totalChapters: 10,
    totalDuration: 4200,
    price: 299,
    createdAt: '2024-03-20T00:00:00Z'
  }
]

export const mockChapters: Record<string, Chapter[]> = {
  'course-001': [
    { id: 'ch-001-1', courseId: 'course-001', title: '认识Scratch', sequence: 1, duration: 400, hasAssessment: true, videoId: 'video-001' },
    { id: 'ch-001-2', courseId: 'course-001', title: '角色和背景', sequence: 2, duration: 450, hasAssessment: true, videoId: 'video-002' },
    { id: 'ch-001-3', courseId: 'course-001', title: '运动和外貌', sequence: 3, duration: 500, hasAssessment: false, videoId: 'video-003' },
    { id: 'ch-001-4', courseId: 'course-001', title: '声音和动作', sequence: 4, duration: 480, hasAssessment: false, videoId: 'video-004' },
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

// Admin: Create course
export const mockCreateCourse = async (data: Partial<Course>): Promise<Course> => {
  await delay(500)
  const newCourse: Course = {
    id: `course-${Date.now()}`,
    title: data.title || '新课程',
    description: data.description || '',
    coverImage: data.coverImage || 'https://via.placeholder.com/300x200?text=New',
    teacher: data.teacher || mockTeachers['course-001'],
    category: data.category || '其它',
    totalChapters: data.totalChapters || 1,
    totalDuration: data.totalDuration || 0,
    price: data.price || 0,
    createdAt: new Date().toISOString()
  }
  mockCourses.push(newCourse)
  return newCourse
}

// Admin: Update course
export const mockUpdateCourse = async (id: string, data: Partial<Course>): Promise<Course> => {
  await delay(500)
  const index = mockCourses.findIndex(c => c.id === id)
  if (index === -1) throw new Error('Course not found')
  mockCourses[index] = { ...mockCourses[index], ...data }
  return mockCourses[index]
}

// Admin: Delete course
export const mockDeleteCourse = async (id: string): Promise<void> => {
  await delay(500)
  const index = mockCourses.findIndex(c => c.id === id)
  if (index === -1) throw new Error('Course not found')
  mockCourses.splice(index, 1)
}