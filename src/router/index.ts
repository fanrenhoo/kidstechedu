import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Auth views
const Login = () => import('../views/auth/Login.vue')
const RegisterParent = () => import('../views/auth/RegisterParent.vue')
const RegisterChild = () => import('../views/auth/RegisterChild.vue')

// Parent views
const ParentDashboard = () => import('../views/parent/Dashboard.vue')
const ParentChildren = () => import('../views/parent/Children.vue')
const ParentMonitor = () => import('../views/parent/Monitor.vue')
const ParentSettings = () => import('../views/parent/Settings.vue')

// Child views
const ChildAiQa = () => import('../views/child/AiQa.vue')
const ChildAiChat = () => import('../views/child/ai/AiChat.vue')
const ChildLearningSummary = () => import('../views/child/ai/LearningSummary.vue')

const ChildDashboard = () => import('../views/child/Dashboard.vue')
const ChildMyCourses = () => import('../views/child/MyCourses.vue')
const ChildCourses = () => import('../views/child/Courses.vue')
const ChildCourseDetail = () => import('../views/child/CourseDetail.vue')
const ChildLearning = () => import('../views/child/Learning.vue')
const ChildAssessment = () => import('../views/child/Assessment.vue')
const ChildAssessmentHistory = () => import('../views/child/AssessmentHistory.vue')
const ChildPoints = () => import('../views/points/PointsPage.vue')
const ChildBadges = () => import('../views/badges/BadgesPage.vue')

// Shared
const Home = () => import('../views/Home.vue')

// Admin views
const AdminDashboard = () => import('../views/admin/Dashboard.vue')
const AdminCourseManage = () => import('../views/admin/CourseManage.vue')
const AdminResourceManage = () => import('../views/admin/ResourceManage.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/register/parent',
    name: 'RegisterParent',
    component: RegisterParent,
    meta: { guest: true }
  },
  {
    path: '/register/child',
    name: 'RegisterChild',
    component: RegisterChild,
    meta: { requiresAuth: true, userType: 'parent' }
  },

  // Parent routes
  {
    path: '/parent/dashboard',
    name: 'ParentDashboard',
    component: ParentDashboard,
    meta: { requiresAuth: true, userType: 'parent' }
  },
  {
    path: '/parent/children',
    name: 'ParentChildren',
    component: ParentChildren,
    meta: { requiresAuth: true, userType: 'parent' }
  },
  {
    path: '/parent/monitor',
    name: 'ParentMonitor',
    component: ParentMonitor,
    meta: { requiresAuth: true, userType: 'parent' }
  },
  {
    path: '/parent/monitor/:childId',
    name: 'ParentMonitorChild',
    component: ParentMonitor,
    meta: { requiresAuth: true, userType: 'parent' }
  },
  {
    path: '/parent/report',
    name: 'ParentReport',
    component: ParentMonitor,
    meta: { requiresAuth: true, userType: 'parent' }
  },
  {
    path: '/parent/settings/:childId',
    name: 'ParentSettings',
    component: ParentSettings,
    meta: { requiresAuth: true, userType: 'parent' }
  },

  // Child routes
  {
    path: '/child/dashboard',
    name: 'ChildDashboard',
    component: ChildDashboard,
    meta: { requiresAuth: true, userType: 'child' }
  },
  {
    path: '/child/my-courses',
    name: 'ChildMyCourses',
    component: ChildMyCourses,
    meta: { requiresAuth: true, userType: 'child' }
  },
  {
    path: '/child/courses',
    name: 'ChildCourses',
    component: ChildCourses,
    meta: { requiresAuth: true, userType: 'child' }
  },
  {
    path: '/child/course/:courseId',
    name: 'ChildCourseDetail',
    component: ChildCourseDetail,
    meta: { requiresAuth: true, userType: 'child' }
  },
  {
    path: '/child/learning/:courseId/:chapterId',
    name: 'ChildLearning',
    component: ChildLearning,
    meta: { requiresAuth: true, userType: 'child' }
  },
  {
    path: '/child/assessments',
    name: 'ChildAssessmentHistory',
    component: () => import('../views/child/AssessmentHistory.vue'),
    meta: { requiresAuth: true, userType: 'child' }
  },
  {
    path: '/child/assessment/:chapterId',
    name: 'ChildAssessment',
    component: ChildAssessment,
    meta: { requiresAuth: true, userType: 'child' }
  },
  {
    path: '/child/points',
    name: 'ChildPoints',
    component: ChildPoints,
    meta: { requiresAuth: true, userType: 'child' }
  },
  {
    path: '/child/badges',
    name: 'ChildBadges',
    component: ChildBadges,
    meta: { requiresAuth: true, userType: 'child' }
  },
  {
    path: '/child/ai-qa',
    name: 'ChildAiQa',
    component: ChildAiQa,
    meta: { requiresAuth: true, userType: 'child' }
  },
  {
    path: '/child/ai-chat',
    name: 'ChildAiChat',
    component: ChildAiChat,
    meta: { requiresAuth: true, userType: 'child' }
  },
  {
    path: '/child/learning-summary',
    name: 'ChildLearningSummary',
    component: ChildLearningSummary,
    meta: { requiresAuth: true, userType: 'child' }
  },

  // Admin routes
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, userType: 'admin' }
  },
  {
    path: '/admin/courses',
    name: 'AdminCourseManage',
    component: AdminCourseManage,
    meta: { requiresAuth: true, userType: 'admin' }
  },
  {
    path: '/admin/resources',
    name: 'AdminResourceManage',
    component: AdminResourceManage,
    meta: { requiresAuth: true, userType: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Initialize auth from localStorage on first load
  if (!authStore.user) {
    authStore.init()
  }

  const { requiresAuth, userType, guest } = to.meta

  // Guest only routes (login, register)
  if (guest && authStore.isAuthenticated) {
    // If already logged in, redirect to appropriate dashboard
    if (authStore.isAdmin) {
      return next({ name: 'AdminDashboard' })
    } else if (authStore.isParent) {
      return next({ name: 'ParentDashboard' })
    } else {
      return next({ name: 'ChildDashboard' })
    }
  }

  // Protected routes
  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'Login' })
    }

    // Role-based access
    if (userType && authStore.userType !== userType) {
      // Redirect to appropriate dashboard based on actual role
      if (authStore.isAdmin) {
        return next({ name: 'AdminDashboard' })
      } else if (authStore.isParent) {
        return next({ name: 'ParentDashboard' })
      } else {
        return next({ name: 'ChildDashboard' })
      }
    }
  }

  next()
})

export default router