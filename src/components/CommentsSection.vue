<template>
  <div class="comments-section">
    <h3 class="comments-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      评论 ({{ comments.length }})
    </h3>
    
    <!-- Comment Form -->
    <div class="comment-form">
      <div class="form-row">
        <input 
          v-model="newComment.author" 
          type="text" 
          class="form-input"
          :placeholder="$t('comments.name')"
        />
        <input 
          v-model="newComment.email" 
          type="email" 
          class="form-input"
          :placeholder="$t('comments.email')"
        />
      </div>
      <textarea 
        v-model="newComment.content" 
        class="form-textarea"
        :placeholder="$t('comments.placeholder')"
        rows="3"
      ></textarea>
      <button 
        class="submit-btn" 
        @click="submitComment"
        :disabled="!newComment.content.trim() || submitting"
      >
        {{ submitting ? $t('comments.submitting') : $t('comments.submit') }}
      </button>
    </div>
    
    <!-- Comments List -->
    <div class="comments-list">
      <div 
        v-for="comment in comments" 
        :key="comment.id" 
        class="comment-item"
        :class="{ 'is-reply': comment.parent_id }"
      >
        <div class="comment-avatar">
          <img 
            :src="comment.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`" 
            :alt="comment.author"
          />
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author }}</span>
            <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
          </div>
          <div class="comment-body" v-html="highlightKeyword(comment.content)"></div>
          <div class="comment-actions">
            <button class="reply-btn" @click="showReplyForm(comment)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 17 4 12 9 7"/>
                <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
              </svg>
              {{ $t('comments.reply') }}
            </button>
          </div>
          
          <!-- Reply Form -->
          <div v-if="replyingTo === comment.id" class="reply-form">
            <input 
              v-model="replyContent" 
              type="text" 
              class="form-input"
              :placeholder="$t('comments.replyPlaceholder')"
            />
            <div class="reply-actions">
              <button class="cancel-btn" @click="cancelReply">{{ $t('comments.cancel') }}</button>
              <button 
                class="submit-btn small" 
                @click="submitReply(comment.id)"
                :disabled="!replyContent.trim() || submitting"
              >
                {{ $t('comments.submit') }}
              </button>
            </div>
          </div>
          
          <!-- Replies -->
          <div v-if="comment.replies?.length" class="comment-replies">
            <div 
              v-for="reply in comment.replies" 
              :key="reply.id" 
              class="comment-item is-reply"
            >
              <div class="comment-avatar small">
                <img 
                  :src="reply.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author}`" 
                  :alt="reply.author"
                />
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ reply.author }}</span>
                  <span class="comment-date">{{ formatDate(reply.created_at) }}</span>
                </div>
                <div class="comment-body" v-html="highlightKeyword(reply.content)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="comments.length === 0" class="no-comments">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>{{ $t('comments.empty') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getComments, createComment } from '@/api'

const { t } = useI18n()
const route = useRoute()

const props = defineProps({
  postId: {
    type: [Number, String],
    required: true
  },
  searchKeyword: {
    type: String,
    default: ''
  }
})

const comments = ref([])
const submitting = ref(false)
const replyingTo = ref(null)
const replyContent = ref('')

const newComment = ref({
  author: '',
  email: '',
  content: ''
})

const fetchComments = async () => {
  try {
    const { data } = await getComments(props.postId)
    comments.value = data.comments || data || []
  } catch (err) {
    console.error('Failed to fetch comments:', err)
  }
}

const submitComment = async () => {
  if (!newComment.value.content.trim()) return
  
  submitting.value = true
  try {
    await createComment({
      post_id: props.postId,
      author: newComment.value.author || '匿名用户',
      email: newComment.value.email,
      content: newComment.value.content,
      parent_id: null
    })
    
    newComment.value = { author: '', email: '', content: '' }
    await fetchComments()
  } catch (err) {
    console.error('Failed to submit comment:', err)
    alert(t('comments.error'))
  } finally {
    submitting.value = false
  }
}

const showReplyForm = (comment) => {
  replyingTo.value = comment.id
  replyContent.value = ''
}

const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

const submitReply = async (parentId) => {
  if (!replyContent.value.trim()) return
  
  submitting.value = true
  try {
    await createComment({
      post_id: props.postId,
      author: newComment.value.author || '匿名用户',
      email: newComment.value.email,
      content: replyContent.value,
      parent_id: parentId
    })
    
    cancelReply()
    await fetchComments()
  } catch (err) {
    console.error('Failed to submit reply:', err)
    alert(t('comments.error'))
  } finally {
    submitting.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const highlightKeyword = (text) => {
  if (!props.searchKeyword || !text) return text
  
  const keyword = props.searchKeyword.trim()
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

watch(() => props.postId, fetchComments, { immediate: true })
</script>

<style scoped>
.comments-section {
  margin-top: 64px;
  padding-top: 32px;
  border-top: 1px solid var(--border-light);
}

.comments-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 32px;
  
  svg {
    width: 24px;
    height: 24px;
    color: var(--accent-primary);
  }
}

/* Comment Form */
.comment-form {
  background: var(--bg-secondary);
  padding: 24px;
  border-radius: var(--radius-lg);
  margin-bottom: 32px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
}

.form-input,
.form-textarea {
  flex: 1;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
  
  &::placeholder {
    color: var(--text-muted);
  }
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
}

.form-textarea {
  width: 100%;
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  margin-top: 16px;
  padding: 12px 32px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover:not(:disabled) {
    background: var(--accent-hover);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &.small {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  display: flex;
  gap: 16px;
  
  &.is-reply {
    margin-left: 48px;
    padding-left: 16px;
    border-left: 2px solid var(--border-light);
  }
}

.comment-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  
  &.small {
    width: 36px;
    height: 36px;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  color: var(--text-primary);
}

.comment-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.comment-body {
  color: var(--text-secondary);
  line-height: 1.6;
  
  :deep(mark) {
    background: var(--accent-primary);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
  }
}

.comment-actions {
  margin-top: 12px;
}

.reply-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  transition: color var(--transition-fast);
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  &:hover {
    color: var(--accent-primary);
  }
}

/* Reply Form */
.reply-form {
  margin-top: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  
  .form-input {
    margin-bottom: 12px;
  }
}

.reply-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 8px 16px;
  background: none;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--text-muted);
  }
}

/* Comment Replies */
.comment-replies {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* No Comments */
.no-comments {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-muted);
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    font-size: 1rem;
  }
}
</style>
