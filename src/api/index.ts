import axios from 'axios'
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// Base URL - configurable via environment
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Token management
const getAccessToken = (): string | null => localStorage.getItem('accessToken')
const getRefreshToken = (): string | null => localStorage.getItem('refreshToken')

const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

const clearTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors and token refresh
// Flag to prevent race condition during token refresh
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          try {
            // Call refresh token endpoint
            const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
            const { accessToken, refreshToken: newRefreshToken } = response.data.data

            setTokens(accessToken, newRefreshToken)
            onTokenRefreshed(accessToken)
            isRefreshing = false

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`
            }
            return api(originalRequest)
          } catch (refreshError) {
            // Refresh failed - logout user
            isRefreshing = false
            refreshSubscribers = []
            clearTokens()
            router.push('/login')
            ElMessage.error('登录已过期，请重新登录')
            return Promise.reject(refreshError)
          }
        } else {
          // No refresh token - redirect to login
          isRefreshing = false
          clearTokens()
          router.push('/login')
        }
      } else {
        // Another refresh is in progress, wait for it
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(api(originalRequest))
          })
          // Timeout fallback
          setTimeout(() => {
            reject(new Error('Token refresh timeout'))
          }, 10000)
        })
      }
    }

    // Handle other errors
    const errorData = error.response?.data as { error?: { code?: string; message?: string }; message?: string } | undefined
    if (errorData?.error?.message) {
      ElMessage.error(errorData.error.message || '请求失败')
    } else if (error.message) {
      ElMessage.error(error.message)
    }

    return Promise.reject(error)
  }
)

export default api
