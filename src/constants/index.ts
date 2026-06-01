// API Constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export const API_TIMEOUT = 30000 // 30 seconds

// Mock API delays (ms)
export const MOCK_DELAY_SHORT = 300
export const MOCK_DELAY_MEDIUM = 500
export const MOCK_DELAY_LONG = 800

// Polling intervals (ms)
export const HEARTBEAT_INTERVAL = 60000 // 1 minute
export const STATUS_POLL_INTERVAL = 30000 // 30 seconds

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const DEFAULT_PAGE = 1

// Local storage keys
export const STORAGE_KEY_ACCESS_TOKEN = 'accessToken'
export const STORAGE_KEY_REFRESH_TOKEN = 'refreshToken'
export const STORAGE_KEY_USER = 'user'

// Route names
export const ROUTE_LOGIN = 'Login'
export const ROUTE_HOME = 'Home'
export const ROUTE_ADMIN_DASHBOARD = 'AdminDashboard'
export const ROUTE_ADMIN_COURSES = 'AdminCourseManage'
export const ROUTE_PARENT_DASHBOARD = 'ParentDashboard'
export const ROUTE_CHILD_DASHBOARD = 'ChildDashboard'

// User types
export const USER_TYPE_PARENT = 'parent'
export const USER_TYPE_CHILD = 'child'
export const USER_TYPE_ADMIN = 'admin'

// Course categories (Chinese values to match mockCourses)
export const COURSE_CATEGORIES = [
  { value: 'all', label: '全部' },
  { value: 'AI', label: 'AI' },
  { value: '逻辑思维', label: '逻辑思维' },
  { value: '科学', label: '科学' },
  { value: '历史', label: '历史' },
  { value: '其它', label: '其它' }
] as const

export type CourseCategory = typeof COURSE_CATEGORIES[number]['value']
