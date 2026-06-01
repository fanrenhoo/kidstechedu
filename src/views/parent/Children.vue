<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const router = useRouter()

const children = ref([
  { id: 'child-001', username: '小明', createdAt: '2024-01-15' },
  { id: 'child-002', username: '小红', createdAt: '2024-02-20' }
])

const dialogVisible = ref(false)
const newChild = ref({
  nickname: '',
  birthDate: '',
  gender: 'male'
})

const goToMonitor = (childId: string) => {
  router.push(`/parent/monitor/${childId}`)
}

const goToSettings = (childId: string) => {
  router.push(`/parent/settings/${childId}`)
}

const showAddDialog = () => {
  newChild.value = { nickname: '', birthDate: '', gender: 'male' }
  dialogVisible.value = true
}

const addChild = async () => {
  if (!newChild.value.nickname || !newChild.value.birthDate) {
    ElMessage.warning('请填写孩子昵称和生日')
    return
  }
  try {
    await authStore.createChild({
      birthDate: newChild.value.birthDate,
      gender: newChild.value.gender,
      learningGoals: { customGoal: '' }
    })
    ElMessage.success('添加成功')
    dialogVisible.value = false
  } catch {
    ElMessage.error('添加失败')
  }
}
</script>

<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>管理孩子</h2>
        <div>
          <el-button type="primary" @click="showAddDialog">
            添加孩子
          </el-button>
          <el-button @click="$router.push('/parent/dashboard')">返回</el-button>
        </div>
      </div>
    </el-header>
    <el-main>
      <el-table :data="children" style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goToMonitor(row.id)">
              监控
            </el-button>
            <el-button size="small" @click="goToSettings(row.id)">
              设置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>

    <el-dialog v-model="dialogVisible" title="添加孩子" width="500px">
      <el-form :model="newChild" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="newChild.nickname" placeholder="请输入孩子昵称" />
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker v-model="newChild.birthDate" type="date" placeholder="选择生日" style="width: 100%" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="newChild.gender" placeholder="选择性别" style="width: 100%">
            <el-option label="男孩" value="male" />
            <el-option label="女孩" value="female" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addChild">确定</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
