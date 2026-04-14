<script setup lang="ts">
import { onMounted } from 'vue'
import { useCourseStore } from '../../stores/course'

const courseStore = useCourseStore()

onMounted(async () => {
  await courseStore.fetchCourses()
})

const goToCourse = (courseId: string) => {
  window.location.href = `/child/course/${courseId}`
}
</script>

<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>课程列表</h2>
        <el-button @click="$router.push('/child/dashboard')">返回</el-button>
      </div>
    </el-header>
    <el-main>
      <el-row :gutter="20">
        <el-col :span="8" v-for="course in courseStore.courses" :key="course.id">
          <el-card shadow="hover" class="course-card" @click="goToCourse(course.id)">
            <template #header>
              <div class="card-header">{{ course.title }}</div>
            </template>
            <img :src="course.coverImage" class="cover-image" />
            <p class="description">{{ course.description }}</p>
            <el-divider />
            <div class="course-info">
              <span>教师：{{ course.teacher.name }}</span>
              <span>章节：{{ course.totalChapters }}</span>
            </div>
            <div class="course-tags">
              <el-tag type="success">{{ course.category }}</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="courseStore.courses.length === 0" description="暂无课程" />
    </el-main>
  </el-container>
</template>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.course-card {
  cursor: pointer;
  margin-bottom: 20px;
}
.cover-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
.description {
  margin: 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.course-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}
.course-tags {
  margin-top: 10px;
}
</style>
