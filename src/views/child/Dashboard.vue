<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useCourseStore } from '../../stores/course'

const authStore = useAuthStore()
const courseStore = useCourseStore()

const handleLogout = () => {
  authStore.logout()
}

onMounted(async () => {
  // Fetch enrolled courses
  await courseStore.fetchMyEnrollments()
})
</script>

<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>儿童端</h2>
        <div class="header-actions">
          <span>欢迎，{{ authStore.user?.profile?.nickname || '小朋友' }}</span>
          <el-button @click="handleLogout">退出登录</el-button>
        </div>
      </div>
    </el-header>
    <el-main>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover" @click="$router.push('/child/courses')">
            <template #header>
              <div class="card-header">我的课程</div>
            </template>
            <p>查看已报名的课程，继续学习</p>
            <el-tag type="success">{{ courseStore.enrollments.length }} 门课程</el-tag>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">测验记录</div>
            </template>
            <p>查看历史测验成绩</p>
          </el-card>
        </el-col>
      </el-row>

      <el-divider />

      <h3>我的课程</h3>
      <el-row :gutter="20">
        <el-col :span="8" v-for="enrollment in courseStore.enrollments" :key="enrollment.id">
          <el-card shadow="hover" @click="$router.push(`/child/course/${enrollment.courseId}`)">
            <template #header>
              <div class="card-header">课程 {{ enrollment.courseId }}</div>
            </template>
            <p>已完成：{{ enrollment.completedChapters }} / {{ enrollment.totalChapters }} 章节</p>
            <el-progress
              :percentage="(enrollment.completedChapters / enrollment.totalChapters) * 100"
            />
          </el-card>
        </el-col>
        <el-col :span="8" v-if="courseStore.enrollments.length === 0">
          <el-empty description="暂未报名课程">
            <el-button type="primary" @click="$router.push('/child/courses')">
              去选课
            </el-button>
          </el-empty>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.card-header {
  font-size: 18px;
  font-weight: bold;
}
</style>
