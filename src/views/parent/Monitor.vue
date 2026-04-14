<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGuardianStore } from '../../stores/guardian'

const route = useRoute()
const guardianStore = useGuardianStore()

const childId = route.params.childId as string

onMounted(() => {
  // Start polling for live status
  guardianStore.startStatusPolling(childId, 30000) // 30 seconds
})

onUnmounted(() => {
  guardianStore.stopStatusPolling()
})
</script>

<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>实时监控</h2>
        <el-button @click="$router.push('/parent/children')">返回</el-button>
      </div>
    </el-header>
    <el-main>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">当前状态</div>
            </template>
            <el-descriptions :column="1" border v-if="guardianStore.currentStatus">
              <el-descriptions-item label="是否在线">
                <el-tag :type="guardianStore.currentStatus.isOnline ? 'success' : 'info'">
                  {{ guardianStore.currentStatus.isOnline ? '在线' : '离线' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="今日学习时长">
                {{ guardianStore.currentStatus.todayTotalMins }} 分钟
              </el-descriptions-item>
              <el-descriptions-item label="每日限制">
                {{ guardianStore.currentStatus.dailyLimitMins }} 分钟
              </el-descriptions-item>
              <el-descriptions-item label="剩余时长">
                {{ guardianStore.currentStatus.remainingMins }} 分钟
              </el-descriptions-item>
            </el-descriptions>
            <el-empty v-else description="暂无数据" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">当前课程</div>
            </template>
            <div v-if="guardianStore.currentStatus?.currentCourse">
              <p>课程：{{ guardianStore.currentStatus.currentCourse.title }}</p>
            </div>
            <el-empty v-else description="当前无进行中的课程" />
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">当前会话</div>
            </template>
            <div v-if="guardianStore.currentStatus?.currentSession">
              <p>开始时间：{{ guardianStore.currentStatus.currentSession.startTime }}</p>
              <p>已学习：{{ guardianStore.currentStatus.currentSession.watchedMins }} 分钟</p>
            </div>
            <el-empty v-else description="当前无进行中的学习会话" />
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
.card-header {
  font-weight: bold;
}
</style>
