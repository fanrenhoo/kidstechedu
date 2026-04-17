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
// userType determines API path: /auth/login/parent or /auth/login/child
// Parent uses: { identifier, password }
// Child uses: { childId, credentialType, credential }
export const login = (data: LoginRequest, userType: 'parent' | 'child' = 'parent') => {
  if (userType === 'child') {
    return api.post<LoginResponse>(`/auth/login/${userType}`, {
      childId: data.identifier,
      credentialType: 'password',
      credential: data.password
    })
  }
  return api.post<LoginResponse>(`/auth/login/${userType}`, data)
}

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
