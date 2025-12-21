import { PGlite } from '@electric-sql/pglite'
import { live } from '@electric-sql/pglite/live'
import { vector } from '@electric-sql/pglite/vector'
import schema from './schemas.sql?raw'

export async function initDB() {
  const db = new PGlite('idb://pglite-tickets', {
    extensions: { live, vector },
  })

  try {
    const result = await db.query('SELECT * FROM productos LIMIT 1')
    if (result.rows.length === 0) {
      await db.exec(schema)
      console.log('Base de datos inicializada con schema')
    }
  } catch (error) {
    console.warn('Error inicializando DB, aplicando schema:', error)
    await db.exec(schema)
  }

  return db
}
