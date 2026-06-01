<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { getSummary, generateSummary, type AiSummary } from '../../api/ai'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()

const summary = ref<AiSummary | null>(null)
const isLoading = ref(false)
const isGenerating = ref(false)

onMounted(async () => {
  await loadSummary()
})

const loadSummary = async () => {
  isLoading.value = true
  try {
    const result = await getSummary(authStore.userId || 'child-001')
    summary.value = result.data
  } catch (error) {
    console.error('Failed to load summary:', error)
    ElMessage.error('加载学习总结失败')
  } finally {
    isLoading.value = false
  }
}

const handleGenerate = async () => {
  isGenerating.value = true
  try {
    const result = await generateSummary(authStore.userId || 'child-001')
    summary.value = result.data
    ElMessage.success('学习报告已生成')
  } catch (error) {
    ElMessage.error('生成报告失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="summary-container">
    <!-- Header -->
    <div class="summary-header">
      <h2>学习报告</h2>
      <p class="subtitle">查看你的学习进度和建议</p>
    </div>

    <!-- Generate Button -->
    <div class="generate-section">
      <el-button
        type="primary"
        :loading="isGenerating"
        @click="handleGenerate"
      >
        {{ isGenerating ? '生成中...' : '生成新报告' }}
      </el-button>
      <p class="hint">基于最近的学习数据生成个性化报告</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- Summary Content -->
    <div v-else-if="summary" class="summary-content">
      <!-- Period -->
      <div class="period-card">
        <div class="period-icon">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="period-info">
          <span class="period-label">报告周期</span>
          <span class="period-value">{{ summary.period }}</span>
        </div>
      </div>

      <!-- Summary Text -->
      <div class="summary-card">
        <h3>学习总结</h3>
        <p class="summary-text">{{ summary.summary }}</p>
        <span class="update-time">生成于 {{ formatDate(summary.createdAt) }}</span>
      </div>

      <!-- Recommendations -->
      <div class="recommendations-card">
        <h3>学习建议</h3>
        <ul class="recommendation-list">
          <li v-for="(rec, index) in summary.nextRecommendations" :key="index">
            <el-icon><ArrowRight /></el-icon>
            <span>{{ rec }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <el-icon size="64"><Document /></el-icon>
      <p>暂无学习报告</p>
      <el-button type="primary" @click="handleGenerate">生成报告</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Calendar, Document, ArrowRight, Loading } from '@element-plus/icons-vue'
export default {
  components: { Calendar, Document, ArrowRight, Loading }
}
</script>

<style scoped>
.summary-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.summary-header {
  text-align: center;
  margin-bottom: 24px;
}

.summary-header h2 {
  color: #667eea;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.generate-section {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 24px;
}

.hint {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: #999;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.period-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #fff;
}

.period-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.period-info {
  display: flex;
  flex-direction: column;
}

.period-label {
  font-size: 12px;
  opacity: 0.8;
}

.period-value {
  font-size: 18px;
  font-weight: bold;
}

.summary-card,
.recommendations-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.summary-card h3,
.recommendations-card h3 {
  color: #333;
  margin-bottom: 16px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-text {
  color: #555;
  line-height: 1.8;
  font-size: 15px;
}

.update-time {
  display: block;
  margin-top: 16px;
  color: #999;
  font-size: 12px;
}

.recommendation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommendation-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  color: #555;
}

.recommendation-list li:last-child {
  border-bottom: none;
}

.recommendation-list li .el-icon {
  color: #667eea;
  margin-top: 2px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.empty-state .el-icon {
  color: #ccc;
  margin-bottom: 16px;
}

.empty-state p {
  color: #999;
  margin-bottom: 20px;
}
</style>