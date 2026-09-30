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

app.get('/', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BienEstar API</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f7f5f0; color: #1a2e1e; font-family: system-ui, sans-serif; }
    main { max-width: 34rem; padding: 2rem; }
    h1 { color: #1d6b4a; font-size: 1.8rem; }
    a { color: #1d6b4a; }
  </style>
</head>
<body>
  <main>
    <h1>API de Bienestar Estudiantil</h1>
    <p>El backend está en línea. Esta dirección no muestra la aplicación: sirve los datos de hábitos, sesión y reportes.</p>
    <p>Comprueba el servicio en <a href="/api/salud">/api/salud</a>.</p>
  </main>
</body>
</html>`)
})

app.get('/api/salud', (_req, res) => {
  res.json({ ok: true, servicio: 'bienestar-estudiantil' })
})

app.use('/api/auth', authRoutes)
app.use('/api/habitos', habitRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/notificaciones', notificationRoutes)
app.use('/api/admin', adminRoutes)

app.use((req, res) => {
  res.status(404).json({ message: `No existe la ruta ${req.method} ${req.path}` })
})

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
