<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()

const phone = ref('')
const verifyCode = ref('')
const email = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

const handleRegister = async () => {
  if (!phone.value || !verifyCode.value || !email.value || !name.value || !password.value) {
    ElMessage.warning('请填写所有必填项')
    return
  }

  if (password.value !== confirmPassword.value) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  if (password.value.length < 6) {
    ElMessage.warning('密码长度至少为6位')
    return
  }

  isLoading.value = true
  try {
    await authStore.registerParent({
      phone: phone.value,
      verifyCode: verifyCode.value,
      email: email.value,
      password: password.value,
      name: name.value
    })
    ElMessage.success('注册成功！')
  } catch (error) {
    ElMessage.error('注册失败，请重试')
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
          <span>家长注册</span>
        </div>
      </template>
      <el-form @submit.prevent="handleRegister" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="验证码">
          <el-input v-model="verifyCode" placeholder="请输入验证码" style="width: 60%" />
          <el-button style="margin-left: 8px">获取验证码</el-button>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="email" type="email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="password"
            type="password"
            placeholder="请输入密码（至少6位）"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="isLoading"
            style="width: 100%"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
      <div class="footer">
        <span>已有账号？</span>
        <el-link type="primary" @click="$router.push('/login')">
          立即登录
        </el-link>
      </div>
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
.footer {
  text-align: center;
  margin-top: 16px;
}
</style>
