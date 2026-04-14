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
const ChildDashboard = () => import('../views/child/Dashboard.vue')
const ChildCourses = () => import('../views/child/Courses.vue')
const ChildCourseDetail = () => import('../views/child/CourseDetail.vue')
const ChildLearning = () => import('../views/child/Learning.vue')
const ChildAssessment = () => import('../views/child/Assessment.vue')

// Shared
const Home = () => import('../views/Home.vue')

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
    meta: { guest: true }
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
    path: '/parent/monitor/:childId',
    name: 'ParentMonitor',
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
    path: '/child/assessment/:chapterId',
    name: 'ChildAssessment',
    component: ChildAssessment,
    meta: { requiresAuth: true, userType: 'child' }
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
    if (authStore.isParent) {
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
      if (authStore.isParent) {
        return next({ name: 'ParentDashboard' })
      } else {
        return next({ name: 'ChildDashboard' })
      }
    }
  }

  next()
})

export default router
