<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as authApi from '../../api/auth'

const router = useRouter()

const nickname = ref('')
const birthDate = ref('')
const gender = ref('male')
const customGoal = ref('')
const isLoading = ref(false)

const handleRegister = async () => {
  if (!nickname.value || !birthDate.value) {
    ElMessage.warning('请填写所有必填项')
    return
  }

  // Get parent ID from localStorage (stored during login)
  const userData = localStorage.getItem('user')
  if (!userData) {
    ElMessage.error('请先以家长身份登录')
    router.push('/login')
    return
  }

  const parent = JSON.parse(userData)
  if (parent.userType !== 'parent') {
    ElMessage.error('只有家长才能创建儿童账号')
    return
  }

  isLoading.value = true
  try {
    await authApi.createChild({
      birthDate: birthDate.value,
      gender: gender.value,
      learningGoals: {
        customGoal: customGoal.value
      }
    })
    ElMessage.success('儿童账号创建成功！')
    router.push('/parent/children')
  } catch (error) {
    ElMessage.error('创建失败，请重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <span>创建儿童账号</span>
        </div>
      </template>
      <el-form @submit.prevent="handleRegister" label-width="100px">
        <el-form-item label="昵称">
          <el-input v-model="nickname" placeholder="请输入儿童昵称" />
        </el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker
            v-model="birthDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="gender" placeholder="请选择性别" style="width: 100%">
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
          </el-select>
        </el-form-item>
        <el-form-item label="学习目标">
          <el-input
            v-model="customGoal"
            type="textarea"
            placeholder="请输入学习目标（选填）"
            :rows="3"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="isLoading"
            style="width: 100%"
          >
            创建
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.register-card {
  width: 450px;
}
.card-header {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
}
</style>
