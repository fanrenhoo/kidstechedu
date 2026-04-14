<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLearningStore } from '../../stores/learning'
import { useCourseStore } from '../../stores/course'
import { useAuthStore } from '../../stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const learningStore = useLearningStore()
const courseStore = useCourseStore()
const authStore = useAuthStore()

const chapterId = route.params.chapterId as string

const answers = ref<(number | number[])[]>([])
const isSubmitting = ref(false)
const result = ref<{ score: number; passed: boolean } | null>(null)

onMounted(async () => {
  await learningStore.fetchAssessmentQuestions(chapterId)
  // Initialize answers array
  answers.value = learningStore.assessmentQuestions.map(() => -1)
})

const handleSubmit = async () => {
  // Validate all questions answered
  const unanswered = answers.value.findIndex(a => a === -1)
  if (unanswered !== -1) {
    ElMessage.warning(`请回答第 ${unanswered + 1} 题`)
    return
  }

  isSubmitting.value = true
  try {
    // Convert answers array to record format
    const answersRecord: Record<string, string | string[]> = {}
    learningStore.assessmentQuestions.forEach((q, idx) => {
      const ans = answers.value[idx]
      // Convert numbers to strings for API compatibility
      if (Array.isArray(ans)) {
        answersRecord[q.id] = ans.map(String)
      } else {
        answersRecord[q.id] = String(ans)
      }
    })
    const submitResult = await learningStore.submitAssessment(authStore.userId || '', answersRecord)
    result.value = {
      score: submitResult.score,
      passed: submitResult.passed
    }

    if (submitResult.passed) {
      ElMessageBox.confirm(`恭喜你！测验通过！得分：${submitResult.score}分`, '测验结果', {
        confirmButtonText: '返回课程',
        cancelButtonText: '继续学习',
        type: 'success'
      }).then(() => {
        // Find courseId from courseStore
        const courseId = courseStore.currentCourse?.id
        if (courseId) {
          router.push(`/child/course/${courseId}`)
        } else {
          router.push('/child/courses')
        }
      }).catch(() => {
        // Stay on page
      })
    } else {
      ElMessage.error(`测验未通过，得分：${submitResult.score}分，请重新学习后再次尝试`)
    }
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>章节测验</h2>
        <el-button @click="$router.back()">返回</el-button>
      </div>
    </el-header>
    <el-main>
      <el-card v-if="!result">
        <el-form @submit.prevent="handleSubmit">
          <div
            v-for="(question, index) in learningStore.assessmentQuestions"
            :key="question.id"
            class="question-item"
          >
            <h4>第{{ index + 1 }}题 ({{ question.questionType === 'multiple_choice' ? '多选' : '单选' }})</h4>
            <p class="question-text">{{ question.question }}</p>

            <el-radio-group
              v-if="question.questionType === 'single_choice' || question.questionType === 'true_false'"
              v-model="answers[index]"
            >
              <el-radio
                v-for="(option, optIndex) in question.options"
                :key="optIndex"
                :label="optIndex"
                style="display: block; margin-bottom: 10px"
              >
                {{ option }}
              </el-radio>
            </el-radio-group>

            <el-checkbox-group
              v-else
              v-model="answers[index]"
            >
              <el-checkbox
                v-for="(option, optIndex) in question.options"
                :key="optIndex"
                :label="optIndex"
                style="display: block; margin-bottom: 10px"
              >
                {{ option }}
              </el-checkbox>
            </el-checkbox-group>

            <el-divider />
          </div>

          <el-button
            type="primary"
            native-type="submit"
            :loading="isSubmitting"
            style="width: 100%"
          >
            提交测验
          </el-button>
        </el-form>
      </el-card>

      <el-card v-else>
        <div class="result-container">
          <el-result
            :icon="result.passed ? 'success' : 'error'"
            :title="result.passed ? '测验通过！' : '测验未通过'"
          >
            <template #sub-title>
              <p>得分：{{ result.score }}分</p>
              <p v-if="!result.passed">建议重新学习后再尝试</p>
            </template>
            <template #extra>
              <el-button type="primary" @click="$router.back()">
                返回
              </el-button>
            </template>
          </el-result>
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
.question-item {
  margin-bottom: 20px;
}
.question-text {
  font-size: 16px;
  margin-bottom: 16px;
}
.result-container {
  padding: 40px;
}
</style>
