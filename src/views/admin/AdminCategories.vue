<template>
  <div class="categories-management">
    <div class="toolbar">
      <div class="toolbar-left">
        <h2>{{ $t('category.list') }}</h2>
      </div>
      <button @click="showForm = true" class="create-btn">
        + {{ $t('category.newCategory') }}
      </button>
    </div>
    
    <div v-if="loading" class="loading">{{ $t('common.loading') }}</div>
    
    <div v-else-if="categories.length === 0" class="empty-state">
      <p>{{ $t('category.noCategories') }}</p>
      <button @click="showForm = true" class="create-btn">{{ $t('category.createFirst') }}</button>
    </div>
    
    <div v-else class="categories-grid">
      <div v-for="cat in categories" :key="cat.id" class="category-card">
        <div class="category-color" :style="{ background: cat.color }"></div>
        <div class="category-info">
          <h3 class="category-name">{{ cat.name }}</h3>
          <span class="category-slug">{{ cat.slug }}</span>
        </div>
        <div class="category-count">{{ cat.posts?.length || 0 }} {{ $t('category.articles') }}</div>
        <div class="category-actions">
          <button @click="editCategory(cat)" class="action-btn edit" :title="$t('common.edit')">✏️</button>
          <button @click="deleteCategory(cat.id)" class="action-btn delete" :title="$t('common.delete')">🗑️</button>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingCategory ? $t('category.editCategory') : $t('category.createCategory') }}</h2>
          <button @click="closeForm" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="submitCategory" class="category-form">
          <div class="form-group">
            <label>{{ $t('category.name') }}</label>
            <input v-model="form.name" type="text" :placeholder="$t('category.name')" required />
          </div>
          
          <div class="form-group">
            <label>{{ $t('category.slug') }}</label>
            <input v-model="form.slug" type="text" placeholder="URL identifier" />
          </div>
          
          <div class="form-group">
            <label>{{ $t('category.color') }}</label>
            <div class="color-picker">
              <button 
                v-for="color in colors" 
                :key="color"
                type="button"
                class="color-option"
                :class="{ active: form.color === color }"
                :style="{ background: color }"
                @click="form.color = color"
              ></button>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeForm" class="cancel-btn">{{ $t('common.cancel') }}</button>
            <button type="submit" class="submit-btn" :disabled="submitting">
              {{ submitting ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCategories, createCategory as apiCreateCategory, deleteCategory as apiDeleteCategory } from '../../api'

const { t } = useI18n()

const handleCreateCategory = (data) => apiCreateCategory(data)
const handleDeleteCategory = (id) => apiDeleteCategory(id)

const categories = ref([])
const loading = ref(false)
const submitting = ref(false)
const showForm = ref(false)
const editingCategory = ref(null)

const colors = [
  '#a855f7', '#6366f1', '#06b6d4', '#10b981', 
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'
]

const form = reactive({
  name: '',
  slug: '',
  color: colors[0]
})

const fetchCategories = async () => {
  loading.value = true
  try {
    const { data } = await getCategories()
    categories.value = data || []
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  } finally {
    loading.value = false
  }
}

const editCategory = (cat) => {
  editingCategory.value = cat
  form.name = cat.name
  form.slug = cat.slug
  form.color = cat.color
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingCategory.value = null
  Object.assign(form, {
    name: '',
    slug: '',
    color: colors[0]
  })
}

const submitCategory = async () => {
  submitting.value = true
  try {
    await handleCreateCategory(form)
    closeForm()
    fetchCategories()
  } catch (err) {
    console.error('Failed to save category:', err)
    alert(err.response?.data?.error || '保存失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  if (confirm(t('category.deleteConfirm'))) {
    try {
      await handleDeleteCategory(id)
      fetchCategories()
    } catch (err) {
      console.error('Failed to delete category:', err)
    }
  }
}

const deleteCategory = handleDelete

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.categories-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar h2 {
  margin: 0;
  color: #fff;
  font-size: 1.25rem;
}

.create-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.4);
}

.loading, .empty-state {
  text-align: center;
  padding: 60px;
  color: rgba(255,255,255,0.5);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  transition: all 0.2s ease;
}

.category-card:hover {
  border-color: rgba(255,255,255,0.1);
}

.category-color {
  width: 12px;
  height: 48px;
  border-radius: 6px;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  margin: 0 0 4px 0;
}

.category-slug {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.4);
}

.category-count {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
  white-space: nowrap;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255,255,255,0.1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  width: 100%;
  max-width: 480px;
  background: #12121a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.modal-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.25rem;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.5);
  font-size: 1.5rem;
  cursor: pointer;
}

.close-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.category-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 0.95rem;
}

.form-group input:focus {
  outline: none;
  border-color: #a855f7;
}

.color-picker {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #fff;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.3);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.cancel-btn {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
}

.submit-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.6;
}
</style>
