<script setup lang="ts">
import { onMounted } from 'vue'
import { useCourseStore } from '../../stores/course'

const courseStore = useCourseStore()

onMounted(async () => {
  await courseStore.fetchMyEnrollments()
})

const goToCourse = (courseId: string) => {
  window.location.href = `/child/course/${courseId}`
}
</script>

<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>我的课程</h2>
        <el-button @click="$router.push('/child/dashboard')">返回</el-button>
      </div>
    </el-header>
    <el-main>
      <el-row :gutter="20" v-if="courseStore.enrollments.length > 0">
        <el-col :span="8" v-for="enrollment in courseStore.enrollments" :key="enrollment.id">
          <el-card shadow="hover" class="course-card" @click="goToCourse(enrollment.courseId)">
            <template #header>
              <div class="card-header">{{ enrollment.course?.title || '课程' }}</div>
            </template>
            <p>已完成：{{ enrollment.completedChapters || 0 }} / {{ enrollment.totalChapters || 0 }} 章节</p>
            <el-progress
              :percentage="enrollment.progressPercentage || 0"
            />
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-else description="暂未报名课程">
        <el-button type="primary" @click="$router.push('/child/courses')">
          去选课
        </el-button>
      </el-empty>
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
</style>
