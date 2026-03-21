<template>
  <div class="posts-management">
    <div class="toolbar">
      <div class="toolbar-left">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">{{ $t('post.all') }}</option>
          <option value="published">{{ $t('post.published') }}</option>
          <option value="draft">{{ $t('post.draft') }}</option>
        </select>
      </div>
      <button @click="showCreateForm = true" class="create-btn">
        + {{ $t('post.newPost') }}
      </button>
    </div>
    
    <div v-if="loading" class="loading">{{ $t('common.loading') }}</div>
    
    <div v-else-if="posts.length === 0" class="empty-state">
      <p>{{ $t('post.noPosts') }}</p>
      <button @click="showCreateForm = true" class="create-btn">{{ $t('post.createFirst') }}</button>
    </div>
    
    <div v-else class="posts-list">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-cover" v-if="post.cover">
          <img :src="post.cover" :alt="post.title" />
        </div>
        <div class="post-content">
          <div class="post-header">
            <h3 class="post-title">{{ post.title }}</h3>
            <span class="post-status" :class="post.status">{{ $t('post.' + post.status) }}</span>
          </div>
          <div class="post-meta">
            <span class="category" :style="{ color: post.category?.color }">
              {{ post.category?.name || $t('post.uncategorized') }}
            </span>
            <span class="separator">•</span>
            <span class="date">{{ formatDate(post.created_at) }}</span>
            <span class="separator">•</span>
            <span class="views">{{ post.view_count }} {{ $t('post.views') }}</span>
          </div>
        </div>
        <div class="post-actions">
          <button @click="editPost(post)" class="action-btn edit" :title="$t('common.edit')">✏️</button>
          <button @click="deletePost(post.id)" class="action-btn delete" :title="$t('common.delete')">🗑️</button>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal" :class="{ 'with-ai-assistant': true }">
        <div class="modal-header">
          <h2>{{ editingPost ? $t('post.editPost') : $t('post.createPost') }}</h2>
          <button @click="closeForm" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="submitPost" class="post-form">
          <div class="form-group">
            <label>{{ $t('post.title') }}</label>
            <input v-model="form.title" type="text" :placeholder="$t('post.title')" required />
          </div>
          
          <div class="form-group">
            <label>{{ $t('post.category') }}</label>
            <select v-model="form.category_id" required>
              <option value="">{{ $t('post.selectCategory') }}</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>{{ $t('post.status') }}</label>
            <select v-model="form.status">
              <option value="draft">{{ $t('post.draft') }}</option>
              <option value="published">{{ $t('post.published') }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>{{ $t('post.cover') }}</label>
            <input v-model="form.cover" type="url" placeholder="https://..." />
          </div>
          
          <div class="form-group">
            <label>{{ $t('post.excerpt') }}</label>
            <textarea v-model="form.excerpt" :placeholder="$t('post.excerpt')" rows="2"></textarea>
          </div>
          
          <div class="form-group editor-group">
            <label>{{ $t('post.content') }}</label>
            <div class="editor-wrapper">
              <QuillEditor 
                ref="quillEditorRef"
                v-model:content="form.content" 
                contentType="html"
                theme="snow"
                toolbar="full"
                :placeholder="$t('post.startWriting')"
                @selection-change="handleSelectionChange"
              />
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

    <!-- AI Assistant Sidebar -->
    <AIAssistantSidebar
      v-if="showCreateForm"
      :editor-content="form.content"
      :selected-text="selectedText"
      @apply-content="handleAIApply"
      @show-message="showToastMessage"
      @refresh-selection="handleRefreshSelection"
    />

    <!-- SEO Panel -->
    <SEOPanel
      v-if="showCreateForm"
      :post-title="form.title"
      :post-content="form.content"
      :post-excerpt="form.excerpt"
    />

    <!-- Toast Message -->
    <div v-if="toastMessage" class="toast-message">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAllPosts, createPost as apiCreatePost, updatePost as apiUpdatePost, deletePost as apiDeletePost, getCategories } from '../../api'
import AIAssistantSidebar from '../../components/AIAssistantSidebar.vue'
import SEOPanel from '../../components/SEOPanel.vue'

const handleCreatePost = (data) => apiCreatePost(data)
const handleUpdatePost = (id, data) => apiUpdatePost(id, data)
const handleDeletePost = (id) => apiDeletePost(id)

// 编辑器配置
const toolbars = {
  bold: true, italic: true, header: true, underline: true, strikethrough: true,
  mark: true, superscript: true, subscript: true, quote: true, ol: true, ul: true,
  link: true, table: true, imagelink: true, code: true, htmlcode: true,
  undo: true, redo: true, trash: true, save: true,
  navigation: true, alignleft: true, aligncenter: true, alignright: true,
  subfield: true, preview: true, fullscreen: true
}

const posts = ref([])
const categories = ref([])
const loading = ref(false)
const submitting = ref(false)
const showCreateForm = ref(false)
const editingPost = ref(null)
const statusFilter = ref('all')

// AI Assistant state
const quillEditorRef = ref(null)
const selectedText = ref('')
const toastMessage = ref('')

const form = reactive({
  title: '',
  content: '',
  excerpt: '',
  cover: '',
  status: 'draft',
  category_id: ''
})

const fetchPosts = async () => {
  loading.value = true
  try {
    const { data } = await getAllPosts({ status: statusFilter.value })
    posts.value = data.posts || []
  } catch (err) {
    console.error('Failed to fetch posts:', err)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const { data } = await getCategories()
    categories.value = data || []
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  }
}

const editPost = (post) => {
  editingPost.value = post
  form.title = post.title
  form.content = post.content
  form.excerpt = post.excerpt || ''
  form.cover = post.cover || ''
  form.status = post.status
  form.category_id = post.category_id
  showCreateForm.value = true
}

const closeForm = () => {
  showCreateForm.value = false
  editingPost.value = null
  selectedText.value = ''
  Object.assign(form, {
    title: '',
    content: '',
    excerpt: '',
    cover: '',
    status: 'draft',
    category_id: ''
  })
}

const submitPost = async () => {
  submitting.value = true
  try {
    if (editingPost.value) {
      await handleUpdatePost(editingPost.value.id, form)
    } else {
      await handleCreatePost(form)
    }
    closeForm()
    fetchPosts()
  } catch (err) {
    console.error('Failed to save post:', err)
    alert(err.response?.data?.error || '保存失败')
  } finally {
    submitting.value = false
  }
}

const { t } = useI18n()

const handleDelete = async (id) => {
  if (confirm(t('post.deleteConfirm'))) {
    try {
      await handleDeletePost(id)
      fetchPosts()
    } catch (err) {
      console.error('Failed to delete post:', err)
    }
  }
}

// Expose to template
const deletePost = handleDelete

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Handle Quill selection change to get selected text
const handleSelectionChange = (range) => {
  if (range && range.length > 0 && quillEditorRef.value) {
    try {
      const quill = quillEditorRef.value.quill
      if (quill) {
        selectedText.value = quill.getText(range.index, range.length)
      }
    } catch (e) {
      console.log('Could not get selected text:', e)
    }
  } else {
    selectedText.value = ''
  }
}

// Handle AI apply content
const handleAIApply = (content, target = 'content') => {
  if (target === 'excerpt') {
    form.excerpt = content
  } else {
    form.content = content
  }
}

// Handle refresh selection from AI sidebar
const handleRefreshSelection = () => {
  if (quillEditorRef.value) {
    try {
      const quill = quillEditorRef.value.quill
      if (quill) {
        const range = quill.getSelection()
        if (range && range.length > 0) {
          selectedText.value = quill.getText(range.index, range.length)
        } else {
          selectedText.value = ''
        }
      }
    } catch (e) {
      console.log('Could not get selected text:', e)
    }
  }
}

// Show toast message
const showToastMessage = (message) => {
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

watch(statusFilter, () => {
  fetchPosts()
})

onMounted(() => {
  fetchPosts()
  fetchCategories()
})
</script>

<style scoped>
.posts-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-select {
  padding: 10px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 0.95rem;
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

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  transition: all 0.2s ease;
}

.post-card:hover {
  border-color: rgba(255,255,255,0.1);
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
}

.post-cover {
  width: 100px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.post-title {
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.post-status.published {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.post-status.draft {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
}

.separator {
  opacity: 0.3;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
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
  max-width: 900px;
  max-height: 90vh;
  background: #12121a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal.with-ai-assistant {
  margin-right: 380px;
  transition: margin-right 0.3s ease;
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

.post-form {
  padding: 24px;
  overflow-y: auto;
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

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #a855f7;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

/* Editor Group */
.editor-group {
  flex: 1;
  min-height: 300px;
}

.editor-wrapper {
  min-height: 280px;
  border-radius: 10px;
  overflow: hidden;
}

.editor-wrapper :deep(.ql-toolbar) {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px 10px 0 0;
}

.editor-wrapper :deep(.ql-container) {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-top: none;
  border-radius: 0 0 10px 10px;
  font-size: 0.95rem;
  min-height: 220px;
}

.editor-wrapper :deep(.ql-editor) {
  min-height: 220px;
  color: #fff;
}

.editor-wrapper :deep(.ql-editor.ql-blank::before) {
  color: rgba(255,255,255,0.3);
  font-style: normal;
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

/* Toast Message */
.toast-message {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  z-index: 2000;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
