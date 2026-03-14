import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import App from './App.vue'
import router from './router'
import './assets/styles/main.scss'
// import './assets/styles/admin.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('QuillEditor', QuillEditor)

app.mount('#app')
