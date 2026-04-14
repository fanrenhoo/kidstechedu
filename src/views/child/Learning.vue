<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../../stores/course'
import { useLearningStore } from '../../stores/learning'
import { useGuardianStore } from '../../stores/guardian'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import * as courseApi from '../../api/course'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const learningStore = useLearningStore()
const guardianStore = useGuardianStore()
const authStore = useAuthStore()

const courseId = route.params.courseId as string
const chapterId = route.params.chapterId as string

const videoUrl = ref('')
const videoSource = ref('')
const watchedSeconds = ref(0)
const totalDuration = ref(0)
const heartbeatInterval = ref<number | null>(null)

onMounted(async () => {
  // Fetch video play info
  const chapter = courseStore.chapters.find(c => c.id === chapterId)
  if (chapter?.videoId) {
    try {
      const response = await courseApi.getVideoPlay(chapter.videoId)
      videoUrl.value = response.data.embedUrl
      videoSource.value = response.data.source
      totalDuration.value = chapter.duration // duration in seconds
    } catch (error) {
      ElMessage.error('获取视频失败')
    }
  }

  // Start heartbeat for guardian monitoring
  if (authStore.isChild) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.id) {
      try {
        await guardianStore.startSession(user.id, courseId, chapterId)
        // Send heartbeat every 60 seconds
        heartbeatInterval.value = window.setInterval(async () => {
          await guardianStore.reportHeartbeat(user.id)
        }, 60000)
      } catch (error) {
        // Time limit exceeded or other error
        ElMessage.warning('无法开始学习，请检查时间限制设置')
      }
    }
  }
})

onUnmounted(() => {
  // Stop heartbeat
  if (heartbeatInterval.value) {
    clearInterval(heartbeatInterval.value)
  }
  // End session
  if (authStore.isChild) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.id) {
      guardianStore.endSession(user.id)
    }
  }
})

const updateProgress = async () => {
  try {
    await learningStore.reportProgress({
      chapterId,
      watchedSeconds: watchedSeconds.value,
      duration: totalDuration.value
    })
  } catch (error) {
    console.error('Progress update failed')
  }
}

const goToAssessment = () => {
  router.push(`/child/assessment/${chapterId}`)
}

const handleVideoTimeUpdate = (event: Event) => {
  const video = event.target as HTMLVideoElement
  watchedSeconds.value = Math.floor(video.currentTime)
}

const handleVideoEnded = () => {
  watchedSeconds.value = totalDuration.value
  updateProgress()
}
</script>

<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>学习 - 第{{ courseStore.chapters.find(c => c.id === chapterId)?.sequence }}章</h2>
        <el-button @click="$router.push(`/child/course/${courseId}`)">返回</el-button>
      </div>
    </el-header>
    <el-main>
      <el-row :gutter="20">
        <el-col :span="18">
          <el-card>
            <template #header>
              <div class="card-header">{{ courseStore.chapters.find(c => c.id === chapterId)?.title }}</div>
            </template>
            <!-- Video Player -->
            <div class="video-container">
              <iframe
                v-if="videoSource === 'BILIBILI'"
                :src="videoUrl"
                frameborder="0"
                allowfullscreen
                class="video-iframe"
              />
              <video
                v-else
                :src="videoUrl"
                controls
                class="video-player"
                @timeupdate="handleVideoTimeUpdate"
                @ended="handleVideoEnded"
              />
              <el-empty v-if="!videoUrl" description="暂无视频" />
            </div>
            <el-divider />
            <div class="progress-bar">
              <span>观看进度：{{ Math.round((watchedSeconds / totalDuration) * 100) || 0 }}%</span>
              <el-button type="primary" size="small" @click="updateProgress">
                保存进度
              </el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <template #header>
              <div class="card-header">章节内容</div>
            </template>
            <el-scrollbar height="400px">
              <div
                v-for="chapter in courseStore.chapters"
                :key="chapter.id"
                class="chapter-list-item"
                :class="{ active: chapter.id === chapterId }"
                @click="$router.push(`/child/learning/${courseId}/${chapter.id}`)"
              >
                <span>第{{ chapter.sequence }}章：{{ chapter.title }}</span>
              </div>
            </el-scrollbar>
          </el-card>
          <el-card style="margin-top: 20px">
            <el-button type="success" style="width: 100%" @click="goToAssessment">
              完成章节测验
            </el-button>
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
.video-container {
  width: 100%;
  min-height: 400px;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.video-iframe,
.video-player {
  width: 100%;
  height: 400px;
}
.progress-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chapter-list-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.chapter-list-item:hover {
  background-color: #f5f5f5;
}
.chapter-list-item.active {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: bold;
}
</style>
