<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useCourseStore } from '../../stores/course'
import BaseLayout from '@/components/BaseLayout.vue'

const authStore = useAuthStore()
const courseStore = useCourseStore()

const handleLogout = () => {
  authStore.logout()
}

const openDouyin = () => {
  window.open('https://www.douyin.com/user/72829129075', '_blank')
}

onMounted(async () => {
  await courseStore.fetchMyEnrollments()
})
</script>

<template>
  <BaseLayout title="儿童端">
    <template #header-actions>
      <span>欢迎，{{ authStore.user?.profile?.nickname || '小朋友' }}</span>
      <el-button class="kid-btn" @click="handleLogout">退出登录</el-button>
    </template>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="kid-card" @click="$router.push('/child/my-courses')">
          <template #header>
            <div class="card-header">我的课程</div>
          </template>
          <p>查看已报名的课程，继续学习</p>
          <el-tag type="success" class="kid-tag">{{ courseStore.enrollments.length }} 门课程</el-tag>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="kid-card" @click="$router.push('/child/courses')">
          <template #header>
            <div class="card-header">📚 课程中心</div>
          </template>
          <p>浏览全部课程，按分类筛选</p>
          <el-tag type="primary" class="kid-tag">AI | 逻辑思维 | 科学 | 历史</el-tag>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="kid-card douyin-card" @click="openDouyin">
          <template #header>
            <div class="card-header">🎵 抖音课程</div>
          </template>
          <p>点击前往抖音学习更多精彩内容</p>
          <el-tag type="danger" class="kid-tag">在抖音学习 →</el-tag>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="kid-card" @click="$router.push('/child/points')">
          <template #header>
            <div class="card-header">我的积分</div>
          </template>
          <p>查看积分余额和历史</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="kid-card" @click="$router.push('/child/badges')">
          <template #header>
            <div class="card-header">我的徽章</div>
          </template>
          <p>查看已获得的徽章</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="kid-card" @click="$router.push('/child/assessments')">
          <template #header>
            <div class="card-header">测验记录</div>
          </template>
          <p>查看历史测验成绩</p>
        </el-card>
      </el-col>
    </el-row>

      <el-divider />

      <h3>AI 智能助手</h3>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card shadow="hover" class="kid-card" @click="$router.push('/child/ai-qa')">
            <template #header>
              <div class="card-header">🤖 AI 答疑 & 学习报告</div>
            </template>
            <p>语音或文字提问，查看学习进度分析和成长建议</p>
            <el-tag type="primary" class="kid-tag">AI 助手</el-tag>
          </el-card>
        </el-col>
      </el-row>

      <h3>我的课程</h3>
      <el-row :gutter="20">
        <el-col :span="8" v-for="enrollment in courseStore.enrollments" :key="enrollment.id">
          <el-card shadow="hover" class="kid-card course-card" @click="$router.push('/child/course/' + enrollment.courseId)">
            <template #header>
              <div class="card-header">课程 {{ enrollment.courseId }}</div>
            </template>
            <p>已完成：{{ enrollment.completedChapters }} / {{ enrollment.totalChapters }} 章节</p>
            <el-progress
              :percentage="(enrollment.completedChapters / enrollment.totalChapters) * 100"
              class="kid-progress"
            />
          </el-card>
        </el-col>
        <el-col :span="8" v-if="courseStore.enrollments.length === 0">
          <el-empty description="暂未报名课程">
            <el-button class="kid-btn" type="primary" @click="$router.push('/child/courses')">
              去选课
            </el-button>
          </el-empty>
        </el-col>
      </el-row>
  </BaseLayout>
</template>

<style scoped>
.card-header {
  font-size: 18px;
  font-weight: bold;
}

.douyin-card {
  border: 2px solid #fe2c55;
}

.douyin-card:hover {
  background: linear-gradient(135deg, #fe2c55 0%, #25f4ee 100%);
}

.douyin-card:hover .card-header,
.douyin-card:hover p {
  color: #fff;
}

.douyin-card:hover .kid-tag {
  background: rgba(255,255,255,0.3);
  border-color: rgba(255,255,255,0.5);
  color: #fff;
}
</style>