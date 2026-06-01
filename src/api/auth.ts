import api from './index'
import { useMock } from './mockSwitch'
import * as mockAuth from './mock/auth'
import type {
  AuthTokens,
  RegisterParentRequest,
  CreateChildRequest,
  UserType,
  ParentProfile,
  ChildProfile
} from '../types'

// Login response structure from backend
export interface LoginResponse {
  userId: string
  userType: UserType
  accessToken: string
  refreshToken: string
  profile: ParentProfile | ChildProfile
}

// Parent login request
export interface ParentLoginRequest {
  identifier: string
  password: string
}

// Child login request
export interface ChildLoginRequest {
  childId: string
  credentialType: 'password' | 'pattern' | 'voice'
  credential: string
}

// Create child response
export interface CreateChildResponse {
  childId: string
  nickname: string
  ageGroup: string
  message: string
}

// Parent login - backend: POST /auth/login/parent
export const loginParent = (data: ParentLoginRequest) => {
  if (useMock) {
    return mockAuth.mockLogin(data).then(data => ({ data }))
  }
  return api.post<LoginResponse>('/auth/login/parent', data)
}

// Child login - backend: POST /auth/login/child
export const loginChild = (data: ChildLoginRequest) => {
  if (useMock) {
    return mockAuth.mockLogin({ identifier: data.childId, password: data.credential }).then(data => ({ data }))
  }
  return api.post<LoginResponse>('/auth/login/child', data)
}

// Register parent - backend returns LoginResponseDto directly
export const registerParent = (data: RegisterParentRequest) => {
  if (useMock) {
    return mockAuth.mockRegisterParent(data).then(data => ({ data }))
  }
  return api.post<LoginResponse>('/auth/register', data)
}

// Create child account - backend returns CreateChildResponseDto directly
export const createChild = (data: CreateChildRequest) => {
  if (useMock) {
    return mockAuth.mockCreateChild(data).then(data => ({ data }))
  }
  return api.post<CreateChildResponse>('/children', data)
}

// Refresh token - backend returns AuthTokens directly
export const refreshToken = (refreshToken: string) =>
  api.post<AuthTokens>('/auth/refresh', { refreshToken })

// Get current user - backend returns LoginResponseDto directly
export const getCurrentUser = (userId: string) => {
  if (useMock) {
    return mockAuth.mockGetCurrentUser(userId).then(data => ({ data }))
  }
  return api.get<LoginResponse>(`/auth/${userId}`)
}
