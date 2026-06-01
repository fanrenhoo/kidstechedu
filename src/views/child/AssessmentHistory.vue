<template>
  <div class="assessment-history">
    <div class="page-header kid-header">
      <el-button @click="$router.back()" class="back-btn">← 返回</el-button>
      <h2>测验记录</h2>
    </div>
    <el-main>
      <div v-if="assessments.length === 0" class="empty-state">
        <el-empty description="暂无测验记录" />
      </div>
      <div v-else class="assessments-list">
        <el-card v-for="item in assessments" :key="item.id" class="assessment-card kid-card">
          <div class="assessment-header">
            <span class="assessment-title">{{ item.chapterTitle }}</span>
            <el-tag :type="item.passed ? 'success' : 'danger'" class="kid-tag">
              {{ item.passed ? '通过' : '未通过' }}
            </el-tag>
          </div>
          <div class="assessment-details">
            <div class="detail-item">
              <span class="label">得分：</span>
              <span class="value score">{{ item.score }}分</span>
            </div>
            <div class="detail-item">
              <span class="label">时间：</span>
              <span class="value">{{ formatDate(item.submittedAt) }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
interface AssessmentRecord {
  id: string; chapterId: string; chapterTitle: string; score: number; passed: boolean; submittedAt: string
}
const assessments = ref<AssessmentRecord[]>([
  { id: '1', chapterId: 'ch-001-1', chapterTitle: '认识Scratch', score: 85, passed: true, submittedAt: '2024-03-15T10:30:00Z' },
  { id: '2', chapterId: 'ch-001-2', chapterTitle: '角色和背景', score: 72, passed: true, submittedAt: '2024-03-16T14:20:00Z' },
  { id: '3', chapterId: 'ch-002-1', chapterTitle: 'Python安装和运行', score: 60, passed: true, submittedAt: '2024-03-17T09:15:00Z' }
])
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.assessment-history { min-height: 100vh; background: linear-gradient(135deg, #FFF9F0 0%, #FFE8D6 100%); }
.page-header { background: linear-gradient(135deg, #4ECDC4 0%, #6EE7DE 100%); border-radius: 0 0 24px 24px; padding: 20px 32px; display: flex; align-items: center; gap: 16px; }
.back-btn { background: rgba(255,255,255,0.3); border: none; color: white; font-weight: 600; border-radius: 20px; padding: 8px 16px; }
.back-btn:hover { background: rgba(255,255,255,0.4); }
.page-header h2 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
.assessments-list { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.assessment-card { padding: 16px; }
.assessment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.assessment-title { font-weight: 600; font-size: 16px; color: #333; }
.assessment-details { display: flex; gap: 24px; }
.detail-item { display: flex; align-items: center; gap: 4px; }
.detail-item .label { color: #666; font-size: 14px; }
.detail-item .value { color: #333; font-size: 14px; }
.detail-item .score { color: #4ECDC4; font-weight: 600; }
.empty-state { padding: 60px 0; }
</style>
