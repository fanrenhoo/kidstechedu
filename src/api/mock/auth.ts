// Mock data for auth module

// Mock parent user profile
export const mockParentProfile = {
  id: 'parent-001',
  phone: '13800138000',
  email: 'parent1@example.com',
  name: '家长1'
}

// Mock child user profile
export const mockChildProfile = {
  id: 'child-001',
  nickname: 'child1',
  birthDate: '2015-01-01',
  gender: 'male',
  learningGoals: '编程入门'
}

// Mock tokens
export const mockParentTokens = {
  userId: 'parent-001',
  userType: 'parent',
  accessToken: 'mock-parent-access-token',
  refreshToken: 'mock-parent-refresh-token'
}

export const mockChildTokens = {
  userId: 'child-001',
  userType: 'child',
  accessToken: 'mock-child-access-token',
  refreshToken: 'mock-child-refresh-token'
}

export const mockAdminTokens = {
  userId: 'admin-001',
  userType: 'admin',
  accessToken: 'mock-admin-access-token',
  refreshToken: 'mock-admin-refresh-token'
}

export const mockAdminProfile = {
  id: 'admin-001',
  name: '管理员',
  email: 'admin@kidstech.edu'
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Backend: POST /auth/login - returns LoginResponseDto directly (no wrapper)
// { identifier: phone|email, password, userType?: 'parent' | 'child' | 'admin' }
export const mockLogin = async (data: { identifier: string; password: string; userType?: string }) => {
  await delay(500)

  // Use explicit userType if provided (from UI selection)
  if (data.userType === 'admin') {
    return {
      ...mockAdminTokens,
      profile: mockAdminProfile
    }
  }
  if (data.userType === 'parent') {
    return {
      ...mockParentTokens,
      profile: mockParentProfile
    }
  }
  if (data.userType === 'child') {
    return {
      ...mockChildTokens,
      profile: mockChildProfile
    }
  }

  // Fallback heuristic if userType not provided
  // Admin login: identifier is "admin"
  if (data.identifier === 'admin') {
    return {
      ...mockAdminTokens,
      profile: mockAdminProfile
    }
  }
  // Parent login: identifier is phone (digits only) or email
  const isParent = data.identifier.includes('@') || /^\d+$/.test(data.identifier)
  if (isParent) {
    return {
      ...mockParentTokens,
      profile: mockParentProfile
    }
  }
  return {
    ...mockChildTokens,
    profile: mockChildProfile
  }
}

// Backend: POST /auth/register - returns LoginResponseDto directly
// { phone, verifyCode, email, password, name }
export const mockRegisterParent = async (data: {
  phone: string
  verifyCode: string
  email: string
  password: string
  name: string
}) => {
  await delay(500)
  return {
    userId: 'parent-001',
    userType: 'parent',
    accessToken: 'mock-parent-access-token',
    refreshToken: 'mock-parent-refresh-token',
    profile: {
      ...mockParentProfile,
      phone: data.phone,
      email: data.email,
      name: data.name
    }
  }
}

// Backend: POST /children - returns CreateChildResponseDto directly
// { birthDate, gender, learningGoals: { interests?, target?, customGoal? } }
// Returns: { childId, nickname, ageGroup, message }
export const mockCreateChild = async (_data: {
  birthDate: string
  gender: string
  learningGoals: {
    interests?: string[]
    target?: string
    customGoal?: string
  }
}) => {
  await delay(500)
  return {
    childId: 'child-001',
    nickname: mockChildProfile.nickname,
    ageGroup: '6-12',
    message: '创建成功'
  }
}

// Backend: GET /auth/:userId - returns LoginResponseDto directly
export const mockGetCurrentUser = async (userId: string) => {
  await delay(300)
  if (userId === 'parent-001') {
    return { userId, userType: 'parent', profile: mockParentProfile }
  }
  if (userId === 'admin-001') {
    return { userId, userType: 'admin', profile: mockAdminProfile }
  }
  return { userId, userType: 'child', profile: mockChildProfile }
}
