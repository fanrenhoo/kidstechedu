<template>
  <el-container>
    <el-header class="kid-header">
      <div class="header-left">
        <el-button class="kid-btn" @click="$router.push('/admin/dashboard')">← 返回</el-button>
        <h2>课程管理</h2>
      </div>
      <el-button type="primary" class="kid-btn" @click="showCreateDialog">
        + 创建新课程
      </el-button>
    </el-header>
    <el-main>
      <el-table :data="courses" class="kid-card" stripe>
        <el-table-column prop="title" label="课程名称" width="200" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="totalChapters" label="章节数" width="100" />
        <el-table-column label="封面图" width="120">
          <template #default="{ row }">
            <img :src="row.coverImage" class="course-cover" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" class="kid-btn" @click="editCourse(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="confirmDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>

    <!-- 创建/编辑课程对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" class="kid-dialog">
      <el-form :model="courseForm" label-width="100px">
        <el-form-item label="课程名称">
          <el-input v-model="courseForm.title" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程分类">
          <el-select v-model="courseForm.category" placeholder="请选择分类">
            <el-option label="编程" value="编程" />
            <el-option label="数学" value="数学" />
            <el-option label="英语" value="英语" />
            <el-option label="科学" value="科学" />
            <el-option label="艺术" value="艺术" />
          </el-select>
        </el-form-item>
        <el-form-item label="章节数">
          <el-input-number v-model="courseForm.totalChapters" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-input v-model="courseForm.coverImage" placeholder="请输入封面图URL" />
        </el-form-item>
        <el-form-item label="课程描述">
          <el-input v-model="courseForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="kid-btn" @click="saveCourse">保存</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCourses, createCourse, updateCourse, deleteCourse } from '@/api/course'
import type { Course } from '@/types'

const courses = ref<Course[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('创建课程')
const courseForm = ref<Partial<Course>>({})
const isEditing = ref(false)

onMounted(() => {
  fetchCourses()
})

async function fetchCourses() {
  try {
    const response = await getCourses()
    courses.value = response.data.items || response.data
    ElMessage.success('课程列表加载成功')
  } catch (error) {
    ElMessage.error('加载课程列表失败')
  }
}

function showCreateDialog() {
  dialogTitle.value = '创建课程'
  courseForm.value = { totalChapters: 1 }
  isEditing.value = false
  dialogVisible.value = true
}

function editCourse(course: Course) {
  dialogTitle.value = '编辑课程'
  courseForm.value = { ...course }
  isEditing.value = true
  dialogVisible.value = true
}

async function saveCourse() {
  try {
    if (isEditing.value) {
      await updateCourse(Number(courseForm.value.id), courseForm.value)
      ElMessage.success('课程更新成功')
    } else {
      await createCourse(courseForm.value)
      ElMessage.success('课程创建成功')
    }
    dialogVisible.value = false
    fetchCourses()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

function confirmDelete(course: Course) {
  ElMessageBox.confirm('确定删除该课程吗？此操作不可恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteCourseFn(course)
  })
}

async function deleteCourseFn(course: Course) {
  try {
    await deleteCourse(Number(course.id))
    ElMessage.success('删除成功')
    fetchCourses()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}
</script>

<style scoped>
.kid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--kid-bg);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.course-cover {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 8px;
}
:deep(.kid-dialog .el-dialog) {
  border-radius: 20px;
}
</style>
