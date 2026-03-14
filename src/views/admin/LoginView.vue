<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>✨ Lumina</h1>
        <p>后台管理系统</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            id="username"
            v-model="form.username" 
            type="text" 
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            id="password"
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            required
          />
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <div class="login-footer">
        <router-link to="/">返回首页</router-link>
      </div>
    </div>
    
    <div class="aurora-bg">
      <div class="aurora aurora-1"></div>
      <div class="aurora aurora-2"></div>
      <div class="aurora aurora-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '../../api'

const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { data } = await login(form)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    router.push('/admin/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0f;
  position: relative;
  overflow: hidden;
}

.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  backdrop-filter: blur(20px);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 2.5rem;
  font-weight: 300;
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.login-header p {
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8px;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #a855f7;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.error-message {
  color: #f87171;
  font-size: 0.9rem;
  text-align: center;
  padding: 12px;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 8px;
}

.login-btn {
  padding: 14px;
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.4);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.login-footer a {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.login-footer a:hover {
  color: #a855f7;
}

/* Aurora Background */
.aurora-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.aurora-1 {
  width: 600px;
  height: 600px;
  background: #a855f7;
  top: -200px;
  right: -200px;
  animation: float 20s ease-in-out infinite;
}

.aurora-2 {
  width: 500px;
  height: 500px;
  background: #6366f1;
  bottom: -150px;
  left: -150px;
  animation: float 25s ease-in-out infinite reverse;
}

.aurora-3 {
  width: 400px;
  height: 400px;
  background: #06b6d4;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
}
</style>
