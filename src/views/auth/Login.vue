<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()

const userType = ref<'parent' | 'child' | 'admin'>('parent')
const identifier = ref('')
const password = ref('')
const childId = ref('')
const credential = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (userType.value === 'parent' || userType.value === 'admin') {
    if (!identifier.value || !password.value) {
      ElMessage.warning('请输入账号和密码')
      return
    }
    isLoading.value = true
    try {
      await authStore.loginParent(identifier.value, password.value, userType.value as 'parent' | 'admin')
    } catch (error) {
      ElMessage.error('登录失败，请检查账号和密码')
    } finally {
      isLoading.value = false
    }
  } else {
    if (!childId.value || !credential.value) {
      ElMessage.warning('请输入儿童账号和密码')
      return
    }
    isLoading.value = true
    try {
      await authStore.loginChild(childId.value, 'password', credential.value)
    } catch (error) {
      ElMessage.error('登录失败，请检查儿童账号和密码')
    } finally {
      isLoading.value = false
    }
  }
}
</script>

<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>登录</span>
        </div>
      </template>
      <el-form @submit.prevent="handleLogin">
        <el-form-item label="登录类型">
          <el-radio-group v-model="userType">
            <el-radio value="parent">家长</el-radio>
            <el-radio value="child">儿童</el-radio>
            <el-radio value="admin">管理员</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 家长/管理员登录表单 -->
        <template v-if="userType === 'parent' || userType === 'admin'">
          <el-form-item :label="userType === 'admin' ? '管理员账号' : '手机号/邮箱'">
            <el-input v-model="identifier" :placeholder="userType === 'admin' ? '请输入管理员账号' : '请输入手机号或邮箱'" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
        </template>

        <!-- 儿童登录表单 -->
        <template v-else>
          <el-form-item label="儿童账号">
            <el-input v-model="childId" placeholder="请输入儿童账号" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="credential"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
        </template>

        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="isLoading"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="footer">
        <span>还没有账号？</span>
        <el-link type="primary" @click="$router.push('/register/parent')">
          家长注册
        </el-link>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  width: 400px;
}
.card-header {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
}
.footer {
  text-align: center;
  margin-top: 16px;
}
</style>