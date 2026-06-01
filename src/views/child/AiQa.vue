<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { askAi, getConversations, getCategories, type AiConversation } from '../../api/ai'
import { getSummary, generateSummary, type AiSummary } from '../../api/ai'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const question = ref('')
const selectedCategory = ref('AI')
const isLoading = ref(false)
const conversations = ref<AiConversation[]>([])
const categories = ref<{ id: string; name: string; icon: string }[]>([])
const isListening = ref(false)
const recognition = ref<any>(null)

const summary = ref<AiSummary | null>(null)
const isLoadingSummary = ref(false)
const isGeneratingSummary = ref(false)

onMounted(async () => {
  await loadCategories()
  await loadConversations()
  await loadSummary()
  initSpeechRecognition()
})

const loadCategories = async () => {
  try {
    const catResult = await getCategories()
    categories.value = catResult.data
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const loadConversations = async () => {
  try {
    const histResult = await getConversations(authStore.userId || 'child-001')
    conversations.value = histResult.data.items || []
  } catch (error) {
    console.error('Failed to load conversations:', error)
  }
}

const loadSummary = async () => {
  isLoadingSummary.value = true
  try {
    const result = await getSummary(authStore.userId || 'child-001')
    summary.value = result.data
  } catch (error) {
    console.error('Failed to load summary:', error)
  } finally {
    isLoadingSummary.value = false
  }
}

const initSpeechRecognition = () => {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognition.value = new SpeechRecognition()
    recognition.value.continuous = false
    recognition.value.interimResults = false

    recognition.value.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      question.value = transcript
      isListening.value = false
    }

    recognition.value.onerror = () => {
      isListening.value = false
      ElMessage.error('语音识别出错，请重试')
    }

    recognition.value.onend = () => {
      isListening.value = false
    }
  }
}

const toggleVoice = () => {
  if (!recognition.value) {
    ElMessage.warning('您的浏览器不支持语音识别')
    return
  }

  if (isListening.value) {
    recognition.value.stop()
    isListening.value = false
  } else {
    recognition.value.start()
    isListening.value = true
  }
}

const submitQuestion = async () => {
  if (!question.value.trim()) {
    ElMessage.warning('请输入问题')
    return
  }

  isLoading.value = true
  try {
    const result = await askAi({
      question: question.value,
      category: selectedCategory.value
    })

    conversations.value.unshift(result.data)
    question.value = ''
    ElMessage.success('回答已生成')
  } catch (error) {
    ElMessage.error('提交问题失败，请重试')
  } finally {
    isLoading.value = false
  }
}

const handleGenerateSummary = async () => {
  isGeneratingSummary.value = true
  try {
    const result = await generateSummary(authStore.userId || 'child-001')
    summary.value = result.data
    ElMessage.success('学习报告已生成')
  } catch (error) {
    ElMessage.error('生成报告失败，请重试')
  } finally {
    isGeneratingSummary.value = false
  }
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'AI': '#667eea',
    '逻辑思维': '#764ba2',
    '科学': '#00b894',
    '历史': '#fdcb6e',
    '其它': '#636e72'
  }
  return colors[category] || colors['其它']
}

const goToAiChat = () => {
  router.push('/child/ai-chat')
}

const goToLearningSummary = () => {
  router.push('/child/learning-summary')
}
</script>

<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>AI 智能答疑</h2>
        <el-button @click="$router.push('/child/dashboard')">返回</el-button>
      </div>
    </el-header>
    <el-main>
      <el-row :gutter="20" class="menu-cards">
        <el-col :span="8">
          <el-card class="menu-card" shadow="hover" @click="goToAiChat">
            <div class="card-icon ai-icon">
              <el-icon size="32"><ChatDotRound /></el-icon>
            </div>
            <h3>AI 答疑</h3>
            <p>有问题就问我吧！</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="menu-card" shadow="hover" @click="goToLearningSummary">
            <div class="card-icon summary-icon">
              <el-icon size="32"><Document /></el-icon>
            </div>
            <h3>学习报告</h3>
            <p>查看学习进度和建议</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="menu-card" shadow="hover" @click="goToAiChat">
            <div class="card-icon history-icon">
              <el-icon size="32"><Clock /></el-icon>
            </div>
            <h3>答疑历史</h3>
            <p>查看历史提问记录</p>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="quick-chat-card">
        <template #header>
          <div class="card-header">快速提问</div>
        </template>

        <div class="category-selector">
          <el-radio-group v-model="selectedCategory" size="small">
            <el-radio-button v-for="cat in categories" :key="cat.id" :value="cat.name">
              {{ cat.name }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="question-input">
          <el-input
            v-model="question"
            type="textarea"
            :rows="2"
            placeholder="输入你的问题，或者点击麦克风语音输入..."
            :disabled="isLoading"
          />
          <div class="input-actions">
            <el-button
              :type="isListening ? 'danger' : 'default'"
              circle
              @click="toggleVoice"
              :disabled="!recognition"
            >
              <el-icon><Microphone /></el-icon>
            </el-button>
            <el-button
              type="primary"
              :loading="isLoading"
              @click="submitQuestion"
            >
              提问
            </el-button>
          </div>
        </div>
      </el-card>

      <el-card class="history-card">
        <template #header>
          <div class="card-header">
            <span>最近答疑</span>
            <el-button link type="primary" @click="goToAiChat">查看全部</el-button>
          </div>
        </template>
        <div v-if="conversations.length === 0" class="empty-state">
          还没有提问记录，试试问我一个问题吧！
        </div>
        <div v-else class="conversation-list">
          <div
            v-for="conv in conversations.slice(0, 3)"
            :key="conv.id"
            class="conversation-item"
          >
            <div class="conv-header">
              <el-tag size="small" :style="{ backgroundColor: getCategoryColor(conv.category), color: '#fff', border: 'none' }">
                {{ conv.category }}
              </el-tag>
              <span class="conv-time">{{ formatTime(conv.createdAt) }}</span>
            </div>
            <div class="conv-content">
              <div class="user-question">问：{{ conv.question }}</div>
              <div class="ai-answer">答：{{ conv.answer.substring(0, 100) }}...</div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="summary-card">
        <template #header>
          <div class="card-header">
            <span>学习报告</span>
            <el-button link type="primary" @click="goToLearningSummary">查看详情</el-button>
          </div>
        </template>

        <div v-if="isLoadingSummary" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else-if="summary" class="summary-preview">
          <div class="summary-period">
            <el-icon><Calendar /></el-icon>
            <span>{{ summary.period }}</span>
          </div>
          <p class="summary-text">{{ summary.summary.substring(0, 150) }}...</p>
          <div class="summary-actions">
            <el-button type="primary" size="small" @click="handleGenerateSummary" :loading="isGeneratingSummary">
              更新报告
            </el-button>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>暂无学习报告</p>
          <el-button type="primary" @click="handleGenerateSummary" :loading="isGeneratingSummary">
            生成报告
          </el-button>
        </div>
      </el-card>
    </el-main>
  </el-container>
</template>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-cards {
  margin-bottom: 20px;
}

.menu-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.menu-card:hover {
  transform: translateY(-4px);
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #fff;
}

.ai-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.summary-icon {
  background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
}

.history-icon {
  background: linear-gradient(135deg, #fdcb6e 0%, #f39c12 100%);
}

.menu-card h3 {
  margin: 0 0 8px;
  color: #333;
}

.menu-card p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.quick-chat-card,
.history-card,
.summary-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-selector {
  margin-bottom: 16px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #999;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 30px;
  color: #999;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conversation-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.conv-time {
  color: #999;
  font-size: 12px;
}

.conv-content {
  font-size: 14px;
}

.user-question {
  color: #333;
  margin-bottom: 4px;
}

.ai-answer {
  color: #666;
  font-size: 13px;
}

.summary-preview {
  padding: 0;
}

.summary-period {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
  font-weight: bold;
  margin-bottom: 12px;
}

.summary-text {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.summary-actions {
  text-align: right;
}
</style>