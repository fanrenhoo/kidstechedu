<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../../stores/course'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const courseId = route.params.courseId as string

const isEnrolled = computed(() => courseStore.isEnrolled(courseId))

onMounted(async () => {
  await courseStore.fetchCourseById(courseId)
})

const handleEnroll = async () => {
  try {
    await courseStore.enrollInCourse(courseId)
    ElMessage.success('报名成功！')
    await courseStore.fetchMyEnrollments()
  } catch (error) {
    ElMessage.error('报名失败，请重试')
  }
}

const startLearning = (chapterId: string) => {
  router.push(`/child/learning/${courseId}/${chapterId}`)
}
</script>

<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>{{ courseStore.currentCourse?.title || '课程详情' }}</h2>
        <el-button @click="$router.push('/child/courses')">返回</el-button>
      </div>
    </el-header>
    <el-main v-if="courseStore.currentCourse">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card>
            <img :src="courseStore.currentCourse.coverImage" class="cover-image" />
            <h3>课程介绍</h3>
            <p>{{ courseStore.currentCourse.description }}</p>
            <el-divider />
            <div class="course-meta">
              <span>教师：{{ courseStore.currentCourse.teacher.name }}</span>
              <span>分类：{{ courseStore.currentCourse.category }}</span>
              <span>总章节：{{ courseStore.currentCourse.totalChapters }}</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <template #header>
              <div class="card-header">课程章节</div>
            </template>
            <el-scrollbar height="400px">
              <div
                v-for="chapter in courseStore.chapters"
                :key="chapter.id"
                class="chapter-item"
                @click="isEnrolled && startLearning(chapter.id)"
                :class="{ 'is-enrolled': isEnrolled, 'is-disabled': !isEnrolled }"
              >
                <span class="chapter-sequence">第{{ chapter.sequence }}章</span>
                <span class="chapter-title">{{ chapter.title }}</span>
                <el-tag v-if="chapter.hasAssessment" type="success" size="small">有测验</el-tag>
              </div>
            </el-scrollbar>
            <el-divider />
            <el-button
              v-if="!isEnrolled"
              type="primary"
              style="width: 100%"
              @click="handleEnroll"
            >
              立即报名
            </el-button>
            <el-tag v-else type="success" style="width: 100%; text-align: center">
              已报名
            </el-tag>
          </el-card>
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
.cover-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}
.course-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}
.chapter-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}
.chapter-item:hover {
  background-color: #f5f5f5;
}
.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.chapter-sequence {
  font-weight: bold;
  color: #409eff;
}
.chapter-title {
  flex: 1;
}
</style>
