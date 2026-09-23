import { app } from './src/app.js'
import { env } from './src/config/env-vars.js'
import { pool } from './src/config/database.js'
const PORT = env.PORT
app.listen(PORT, async () => {
  const result = await pool.query('SELECT NOW()')
  console.log('Server running on port', PORT)
  console.log('PostgreSQL conectado:', result.rows[0])
})
