import { Router } from 'express'
import { pool } from '../db.js'
import { asyncHandler, requireAuth } from '../middleware/auth.js'

const router = Router()

const checks = [
  { key: 'sueno', table: 'registro_sueno', icon: '😴', title: 'Registra tu sueño', desc: 'Aún no anotas a qué hora dormiste y despertaste hoy.' },
  { key: 'alimentacion', table: 'registro_alimentacion', icon: '🍽️', title: 'Registra tus comidas', desc: 'Todavía no hay comidas registradas para hoy.' },
  { key: 'hidratacion', table: 'registro_hidratacion', icon: '💧', title: 'Registra tu agua', desc: 'Suma los vasos de agua que llevas en el día.' },
  { key: 'actividad', table: 'registro_actividad_fisica', icon: '🏃', title: 'Registra tu actividad', desc: 'Anota el ejercicio que hiciste hoy, aunque sea una caminata.' },
  { key: 'emocional', table: 'registro_emocional', icon: '💚', title: '¿Cómo te sientes hoy?', desc: 'Tu estado emocional de hoy todavía no está registrado.' },
]

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(req.query.fecha || '')
    ? req.query.fecha
    : new Date().toISOString().slice(0, 10)
  const items = []
  for (const check of checks) {
    const [[row]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${check.table} WHERE id_usuario = ? AND fecha = ?`,
      [req.user.id, fecha],
    )
    if (Number(row.total) === 0) {
      items.push({
        id: check.key,
        icon: check.icon,
        title: check.title,
        desc: check.desc,
        time: 'Hoy',
        unread: true,
      })
    }
  }
  if (items.length === 0) {
    items.push({
      id: 'completo',
      icon: '✅',
      title: 'Día completo',
      desc: 'Ya registraste sueño, alimentación, agua, actividad y ánimo.',
      time: 'Hoy',
      unread: false,
    })
  }
  res.json({ notificaciones: items })
}))

export default router
