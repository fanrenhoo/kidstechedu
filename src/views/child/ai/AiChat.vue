<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { askAi, getConversations, getCategories, type AiConversation } from '../../api/ai'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()

const question = ref('')
const selectedCategory = ref('AI')
const isLoading = ref(false)
const conversations = ref<AiConversation[]>([])
const categories = ref<{ id: string; name: string; icon: string }[]>([])
const isListening = ref(false)
const recognition = ref<any>(null)

// Load categories and history
onMounted(async () => {
  try {
    const catResult = await getCategories()
    categories.value = catResult.data

    const histResult = await getConversations(authStore.userId || 'child-001')
    conversations.value = histResult.data.items
  } catch (error) {
    console.error('Failed to load AI data:', error)
  }

  // Initialize speech recognition if available
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
})

// Toggle voice input
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

// Submit question
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

    // Add to conversations
    conversations.value.unshift(result.data)
    question.value = ''
    ElMessage.success('回答已生成')
  } catch (error) {
    ElMessage.error('提交问题失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// Format time
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get category color
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
</script>

<template>
  <div class="ai-chat-container">
    <!-- Header -->
    <div class="chat-header">
      <h2>AI 智能答疑</h2>
      <p class="subtitle">有问题就问我吧！</p>
    </div>

    <!-- Category Selection -->
    <div class="category-selector">
      <span class="selector-label">选择分类：</span>
      <el-radio-group v-model="selectedCategory" size="small">
        <el-radio-button v-for="cat in categories" :key="cat.id" :value="cat.name">
          {{ cat.name }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- Question Input -->
    <div class="question-input">
      <el-input
        v-model="question"
        type="textarea"
        :rows="3"
        placeholder="输入你的问题，或者点击麦克风语音输入..."
        :disabled="isLoading"
        @keyup.enter.ctrl="submitQuestion"
      />
      <div class="input-actions">
        <el-button
          :type="isListening ? 'danger' : 'default'"
          circle
          :icon="isListening ? 'Stop' : 'Microphone'"
          @click="toggleVoice"
          :disabled="!recognition"
        >
          {{ isListening ? '停止' : '语音' }}
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

    <!-- Conversation History -->
    <div class="conversations">
      <h3>历史记录</h3>
      <div v-if="conversations.length === 0" class="empty-state">
        还没有提问记录，试试问我一个问题吧！
      </div>
      <div v-else class="conversation-list">
        <div
          v-for="conv in conversations"
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
            <div class="user-question">
              <span class="label">问：</span>
              {{ conv.question }}
            </div>
            <div class="ai-answer">
              <span class="label">答：</span>
              {{ conv.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-chat-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.chat-header {
  text-align: center;
  margin-bottom: 20px;
}

.chat-header h2 {
  color: #667eea;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.category-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.selector-label {
  font-weight: 500;
  color: #333;
}

.question-input {
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.conversations {
  margin-top: 24px;
}

.conversations h3 {
  color: #333;
  margin-bottom: 16px;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  background: #f8f9fa;
  border-radius: 8px;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conversation-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.conv-time {
  color: #999;
  font-size: 12px;
}

.conv-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-question {
  background: #e8f0fe;
  padding: 12px;
  border-radius: 8px;
  color: #333;
}

.ai-answer {
  background: #f0f7ff;
  padding: 12px;
  border-radius: 8px;
  color: #444;
  line-height: 1.6;
}

.label {
  font-weight: bold;
  color: #667eea;
}
</style>