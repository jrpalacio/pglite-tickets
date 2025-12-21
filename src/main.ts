import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { PGlite } from '@electric-sql/pglite'
import { live } from '@electric-sql/pglite/live'
import { providePGlite } from '@electric-sql/pglite-vue'
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
// @ts-expect-error - PGlite with live extension is compatible but types don't match exactly
providePGlite(db)

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
