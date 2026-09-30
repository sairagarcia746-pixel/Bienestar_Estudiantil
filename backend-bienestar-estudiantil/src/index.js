import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './db.js'
import authRoutes from './routes/auth.js'
import habitRoutes from './routes/habits.js'
import dashboardRoutes from './routes/dashboard.js'
import notificationRoutes from './routes/notifications.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const app = express()
app.use(cors({ origin: true }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/salud', (_req, res) => {
  res.json({ ok: true, servicio: 'bienestar-estudiantil' })
})

app.use('/api/auth', authRoutes)
app.use('/api/habitos', habitRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/notificaciones', notificationRoutes)
app.use('/api/admin', adminRoutes)

app.use((error, _req, res, _next) => {
  const status = error.status || 500
  if (status >= 500) console.error(error)
  res.status(status).json({
    message: status >= 500 ? 'No se pudo completar la operación' : error.message,
  })
})

const port = Number(process.env.PORT || 3000)

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`API de bienestar escuchando en http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error('No se pudo preparar la base de datos')
    console.error(error.message)
    process.exit(1)
  })
