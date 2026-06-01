import api from './index'
import { useMock } from './mockSwitch'
import * as mockCourse from './mock/course'
import type {
  Course,
  Chapter,
  VideoPlay,
  Enrollment
} from '../types'

// Get all courses - backend returns Course[] directly
export const getCourses = () => {
  if (useMock) {
    return mockCourse.mockGetCourses().then(data => ({ data: { items: data, pagination: { page: 1, pageSize: 20, total: data.length, totalPages: 1 } } }))
  }
  return api.get<Course[]>('/courses')
}

// Get course by ID - backend returns nested object directly with teacher and chapters
export const getCourseById = (courseId: string) => {
  if (useMock) {
    return mockCourse.mockGetCourseById(courseId).then(data => ({ data }))
  }
  return api.get<Course & { teacher: { id: string; name: string; bio: string; avatarUrl: string; specialties: string[] }; chapters: Chapter[] }>(`/courses/${courseId}`)
}

// Get video play info - backend returns VideoPlayDto directly
export const getVideoPlay = (videoId: string) => {
  if (useMock) {
    return mockCourse.mockGetVideoPlay(videoId).then(data => ({ data }))
  }
  return api.get<VideoPlay>(`/videos/${videoId}/play`)
}

// Enroll course - backend returns Enrollment directly
export const enrollCourse = (courseId: string) => {
  if (useMock) {
    return mockCourse.mockEnrollCourse(courseId).then(data => ({ data }))
  }
  return api.post<Enrollment>(`/courses/${courseId}/enroll`)
}

// Get my enrollments - backend returns Enrollment[] directly
export const getMyEnrollments = () => {
  if (useMock) {
    return mockCourse.mockGetMyEnrollments().then(data => ({ data }))
  }
  return api.get<Enrollment[]>('/courses/my-enrollments')
}

// Admin: Create course
export const createCourse = (data: Partial<Course>) => {
  if (useMock) {
    return mockCourse.mockCreateCourse(data).then(result => ({ data: result }))
  }
  return api.post<Course>('/courses', data)
}

// Admin: Update course
export const updateCourse = (id: string, data: Partial<Course>) => {
  if (useMock) {
    return mockCourse.mockUpdateCourse(id, data).then(result => ({ data: result }))
  }
  return api.put<Course>(`/courses/${id}`, data)
}

// Admin: Delete course
export const deleteCourse = (id: string) => {
  if (useMock) {
    return mockCourse.mockDeleteCourse(id).then(() => ({ data: { success: true } }))
  }
  return api.delete<void>(`/courses/${id}`)
}
