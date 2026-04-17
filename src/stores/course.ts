import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Course, Chapter, Enrollment } from '../types'
import * as courseApi from '../api/course'

export const useCourseStore = defineStore('course', () => {
  const courses = ref<Course[]>([])
  const currentCourse = ref<Course | null>(null)
  const chapters = ref<Chapter[]>([])
  const enrollments = ref<Enrollment[]>([])
  const isLoading = ref(false)

  // Get all courses
  const fetchCourses = async () => {
    isLoading.value = true
    try {
      const response = await courseApi.getCourses()
      // Backend returns { items: [...], pagination: {...} }
      courses.value = response.data.items || response.data
    } finally {
      isLoading.value = false
    }
  }

  // Get course by ID (chapters are included in response)
  const fetchCourseById = async (courseId: string) => {
    isLoading.value = true
    try {
      const courseRes = await courseApi.getCourseById(courseId)
      currentCourse.value = courseRes.data
      chapters.value = courseRes.data.chapters || []
    } finally {
      isLoading.value = false
    }
  }

  // Enroll in a course
  const enrollInCourse = async (courseId: string) => {
    const response = await courseApi.enrollCourse(courseId)
    return response.data
  }

  // Get my enrollments
  const fetchMyEnrollments = async () => {
    isLoading.value = true
    try {
      const response = await courseApi.getMyEnrollments()
      // Backend returns { items: [...], pagination: {...} } or direct array
      enrollments.value = response.data.items || response.data
    } finally {
      isLoading.value = false
    }
  }

  // Check if enrolled in a course
  const isEnrolled = (courseId: string) => {
    return enrollments.value.some(e => e.courseId === courseId)
  }

  return {
    courses,
    currentCourse,
    chapters,
    enrollments,
    isLoading,
    fetchCourses,
    fetchCourseById,
    enrollInCourse,
    fetchMyEnrollments,
    isEnrolled
  }
})
