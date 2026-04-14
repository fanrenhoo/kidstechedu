import api from './index'
import type {
  AuthTokens,
  LoginRequest,
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

// Create child response
export interface CreateChildResponse {
  childId: string
  nickname: string
  ageGroup: string
  message: string
}

// Login - backend returns LoginResponseDto directly (no wrapper)
export const login = (data: LoginRequest) =>
  api.post<LoginResponse>('/auth/login', data)

// Register parent - backend returns LoginResponseDto directly
export const registerParent = (data: RegisterParentRequest) =>
  api.post<LoginResponse>('/auth/register', data)

// Create child account - backend returns CreateChildResponseDto directly
export const createChild = (data: CreateChildRequest) =>
  api.post<CreateChildResponse>('/children', data)

// Refresh token - backend returns AuthTokens directly
export const refreshToken = (refreshToken: string) =>
  api.post<AuthTokens>('/auth/refresh', { refreshToken })

// Get current user - backend returns LoginResponseDto directly
export const getCurrentUser = (userId: string) =>
  api.get<LoginResponse>(`/auth/${userId}`)
