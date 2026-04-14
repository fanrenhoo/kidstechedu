<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGuardianStore } from '../../stores/guardian'
import { ElMessage } from 'element-plus'
import type { TimeSlot } from '../../types'

const route = useRoute()
const guardianStore = useGuardianStore()

const childId = route.params.childId as string

const dailyLimitMins = ref(60)
const timeSlots = ref<TimeSlot[]>([])
const isActive = ref(true)
const isLoading = ref(false)

onMounted(async () => {
  try {
    const settings = await guardianStore.fetchGuardianSettings(childId)
    if (settings) {
      dailyLimitMins.value = settings.dailyLimitMins
      timeSlots.value = settings.timeSlots
      isActive.value = settings.isActive
    }
  } catch (error) {
    ElMessage.error('加载设置失败')
  }
})

const saveSettings = async () => {
  isLoading.value = true
  try {
    await guardianStore.updateGuardianSettings({
      childId,
      dailyLimitMins: dailyLimitMins.value,
      timeSlots: timeSlots.value,
      isActive: isActive.value
    })
    ElMessage.success('设置已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    isLoading.value = false
  }
}

const addTimeSlot = () => {
  timeSlots.value.push({ start: '09:00', end: '21:00', days: [] })
}

const removeTimeSlot = (index: number) => {
  timeSlots.value.splice(index, 1)
}
</script>

<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>学习时间设置</h2>
        <el-button @click="$router.push('/parent/children')">返回</el-button>
      </div>
    </el-header>
    <el-main>
      <el-card>
        <el-form label-width="120px">
          <el-form-item label="启用时间限制">
            <el-switch v-model="isActive" />
          </el-form-item>
          <el-form-item label="每日时长限制">
            <el-input-number
              v-model="dailyLimitMins"
              :min="0"
              :max="1440"
              :step="30"
            />
            <span class="unit">分钟</span>
          </el-form-item>
          <el-form-item label="允许学习时段">
            <div v-for="(slot, index) in timeSlots" :key="index" class="time-slot">
              <el-time-select
                v-model="slot.start"
                placeholder="开始时间"
                start="00:00"
                step="00:30"
                end="23:30"
              />
              <span>至</span>
              <el-time-select
                v-model="slot.end"
                placeholder="结束时间"
                start="00:00"
                step="00:30"
                end="23:30"
              />
              <el-button type="danger" size="small" @click="removeTimeSlot(index)">
                删除
              </el-button>
            </div>
            <el-button type="primary" size="small" @click="addTimeSlot">
              添加时段
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="isLoading" @click="saveSettings">
              保存设置
            </el-button>
          </el-form-item>
        </el-form>
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
.unit {
  margin-left: 8px;
}
.time-slot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
</style>
