import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initDB } from '@/db/init'

async function bootstrap() {
  const app = createApp(App)

  const db = await initDB()
  app.provide('db', db)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
}

bootstrap()
