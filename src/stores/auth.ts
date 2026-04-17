import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserType } from '../types'
import { useMock } from '../api/mockSwitch'
import * as authApi from '../api/auth'
import * as mockAuth from '../api/mock/auth'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ userId: string; userType: UserType; profile: Record<string, any> } | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isParent = computed(() => user.value?.userType === 'parent')
  const isChild = computed(() => user.value?.userType === 'child')
  const userType = computed(() => user.value?.userType)
  const userId = computed(() => user.value?.userId)

  // Initialize from localStorage
  const init = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch {
        localStorage.removeItem('user')
      }
    }
  }

  // Login - backend expects { identifier: phone|email, password }
  // Backend returns data directly (no ApiResponse wrapper)
  // userType is required: 'parent' or 'child' for backend API path
  const login = async (identifier: string, password: string, userType: 'parent' | 'child' = 'parent') => {
    isLoading.value = true
    try {
      let userData: { userId: string; userType: UserType; profile: Record<string, any> }
      let tokens: { accessToken: string; refreshToken: string }

      if (useMock) {
        const result = await mockAuth.mockLogin({ identifier, password })
        userData = { userId: result.userId, userType: result.userType as UserType, profile: result.profile }
        tokens = { accessToken: result.accessToken, refreshToken: result.refreshToken }
      } else {
        const response = await authApi.login({ identifier, password }, userType)
        userData = response.data
        tokens = response.data
      }

      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))

      user.value = userData

      // Redirect based on user type
      if (userData.userType === 'parent') {
        router.push('/parent/dashboard')
      } else {
        router.push('/child/dashboard')
      }
    } finally {
      isLoading.value = false
    }
  }

  // Register parent - backend expects { phone, verifyCode, email, password, name }
  const registerParent = async (data: { phone: string; verifyCode: string; email: string; password: string; name: string }) => {
    isLoading.value = true
    try {
      let userData: { userId: string; userType: UserType; profile: Record<string, any> }
      let tokens: { accessToken: string; refreshToken: string }

      if (useMock) {
        const result = await mockAuth.mockRegisterParent(data)
        userData = { userId: result.userId, userType: result.userType as UserType, profile: result.profile }
        tokens = { accessToken: result.accessToken, refreshToken: result.refreshToken }
      } else {
        const response = await authApi.registerParent(data)
        userData = response.data
        tokens = response.data
      }

      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))

      user.value = userData
      router.push('/parent/dashboard')
    } finally {
      isLoading.value = false
    }
  }

  // Create child - backend expects { birthDate, gender, learningGoals: { customGoal? } }
  // Returns: { childId, nickname, ageGroup, message }
  const createChild = async (data: { birthDate: string; gender: string; learningGoals: { customGoal?: string } }) => {
    isLoading.value = true
    try {
      if (useMock) {
        const result = await mockAuth.mockCreateChild(data)
        localStorage.setItem('lastCreatedChild', JSON.stringify(result))
      } else {
        const response = await authApi.createChild(data)
        localStorage.setItem('lastCreatedChild', JSON.stringify(response.data))
      }
      router.push('/parent/children')
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  const logout = () => {
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    router.push('/login')
  }

  // Get current user from API
  const fetchCurrentUser = async () => {
    try {
      if (useMock) {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          user.value = JSON.parse(storedUser)
        }
      } else {
        const storedUserId = user.value?.userId
        if (storedUserId) {
          const response = await authApi.getCurrentUser(storedUserId)
          user.value = response.data
          localStorage.setItem('user', JSON.stringify(response.data))
        }
      }
    } catch {
      logout()
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    isParent,
    isChild,
    userType,
    userId,
    init,
    login,
    registerParent,
    createChild,
    logout,
    fetchCurrentUser
  }
})
