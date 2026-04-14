import api from './index'
import type {
  Course,
  Chapter,
  VideoPlay,
  Enrollment
} from '../types'

// Get all courses - backend returns Course[] directly
export const getCourses = () =>
  api.get<Course[]>('/courses')

// Get course by ID - backend returns nested object directly with teacher and chapters
export const getCourseById = (courseId: string) =>
  api.get<Course & { teacher: { id: string; name: string; bio: string; avatarUrl: string; specialties: string[] }; chapters: Chapter[] }>(`/courses/${courseId}`)

// Get video play info - backend returns VideoPlayDto directly
export const getVideoPlay = (videoId: string) =>
  api.get<VideoPlay>(`/videos/${videoId}/play`)

// Enroll course - backend returns Enrollment directly
export const enrollCourse = (courseId: string) =>
  api.post<Enrollment>(`/courses/${courseId}/enroll`)

// Get my enrollments - backend returns Enrollment[] directly
export const getMyEnrollments = () =>
  api.get<Enrollment[]>('/courses/my-enrollments')
