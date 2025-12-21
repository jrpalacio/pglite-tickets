import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { PGlite } from '@electric-sql/pglite'
import { live } from '@electric-sql/pglite/live'
import schema from '@/db/schemas.sql?raw'

import App from './App.vue'
import router from './router'
import { vector } from '@electric-sql/pglite/vector'

const app = createApp(App)

const db = new PGlite('idb://pglite-tickets', {
  extensions: {
    live,
    vector,
  },
})

// Usar provide nativo de Vue
app.provide('db', db)

// Consulta inicial para verificar la tabla de productos
const result = await db.query('SELECT * FROM productos LIMIT 1')
if (result.rows.length > 0) {
  console.log('Productos existentes:', result.rows)
} else {
  // Ejecuta el schema SQL (usa IF NOT EXISTS para evitar errores)
  console.log('Ejecutando schema SQL...')
  await db.exec(schema)
  console.log('Base de datos lista!')
}

app.use(createPinia())
app.use(router)

app.mount('#app')
