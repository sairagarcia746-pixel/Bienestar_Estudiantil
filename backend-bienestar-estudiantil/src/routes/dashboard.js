import { Router } from 'express'
import { pool } from '../db.js'
import { asyncHandler, requireAuth } from '../middleware/auth.js'

function requestedDay(value) {
  if (!value) {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}`
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const error = new Error('La fecha no es válida')
    error.status = 400
    throw error
  }
  return value
}

const router = Router()
router.use(requireAuth)

router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id
  const fecha = requestedDay(req.query.fecha)
  const [[sueno]] = await pool.query(
    `SELECT horas_totales, calidad_sueno
     FROM registro_sueno WHERE id_usuario = ? AND fecha = ?
     ORDER BY id_sueno DESC LIMIT 1`,
    [userId, fecha],
  )
  const [[comidas]] = await pool.query(
    'SELECT COUNT(*) AS total FROM registro_alimentacion WHERE id_usuario = ? AND fecha = ?',
    [userId, fecha],
  )
  const [[agua]] = await pool.query(
    'SELECT COALESCE(SUM(cantidad_ml), 0) AS total FROM registro_hidratacion WHERE id_usuario = ? AND fecha = ?',
    [userId, fecha],
  )
  const [[actividad]] = await pool.query(
    'SELECT COALESCE(SUM(duracion_minutos), 0) AS total FROM registro_actividad_fisica WHERE id_usuario = ? AND fecha = ?',
    [userId, fecha],
  )
  const [[animo]] = await pool.query(
    `SELECT estado_animo, nivel_estres, notas
     FROM registro_emocional WHERE id_usuario = ? AND fecha = ?
     ORDER BY id_emocional DESC LIMIT 1`,
    [userId, fecha],
  )
  const [animosSemana] = await pool.query(
    `SELECT fecha, estado_animo, nivel_estres
     FROM registro_emocional
     WHERE id_usuario = ? AND fecha >= DATE_SUB(?, INTERVAL 6 DAY)
     ORDER BY fecha ASC, id_emocional ASC`,
    [userId, fecha],
  )
  const [[promedioSueno]] = await pool.query(
    `SELECT ROUND(AVG(horas_totales), 1) AS promedio
     FROM registro_sueno
     WHERE id_usuario = ? AND fecha >= DATE_SUB(?, INTERVAL 6 DAY)`,
    [userId, fecha],
  )
  const [[aguaSemana]] = await pool.query(
    `SELECT COALESCE(SUM(cantidad_ml), 0) AS total
     FROM registro_hidratacion
     WHERE id_usuario = ? AND fecha >= DATE_SUB(?, INTERVAL 6 DAY)`,
    [userId, fecha],
  )
  const [[actividadSemana]] = await pool.query(
    `SELECT COALESCE(SUM(duracion_minutos), 0) AS total
     FROM registro_actividad_fisica
     WHERE id_usuario = ? AND fecha >= DATE_SUB(?, INTERVAL 6 DAY)`,
    [userId, fecha],
  )

  res.json({
    hoy: {
      sueno: sueno || null,
      comidas: Number(comidas.total),
      agua_ml: Number(agua.total),
      actividad_min: Number(actividad.total),
      animo: animo || null,
    },
    semana: {
      sueno_promedio: promedioSueno.promedio == null ? null : Number(promedioSueno.promedio),
      agua_ml: Number(aguaSemana.total),
      actividad_min: Number(actividadSemana.total),
      animos: animosSemana,
    },
  })
}))

router.get('/perfil', asyncHandler(async (req, res) => {
  const userId = req.user.id
  const [fechas] = await pool.query(
    `SELECT DISTINCT fecha FROM (
       SELECT fecha FROM registro_sueno WHERE id_usuario = ?
       UNION SELECT fecha FROM registro_alimentacion WHERE id_usuario = ?
       UNION SELECT fecha FROM registro_hidratacion WHERE id_usuario = ?
       UNION SELECT fecha FROM registro_actividad_fisica WHERE id_usuario = ?
       UNION SELECT fecha FROM registro_emocional WHERE id_usuario = ?
     ) dias ORDER BY fecha DESC`,
    [userId, userId, userId, userId, userId],
  )
  const days = new Set(fechas.map((row) => String(row.fecha).slice(0, 10)))
  const ymd = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
  }
  let streak = 0
  const cursor = new Date()
  if (!days.has(ymd(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (days.has(ymd(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  res.json({ dias_registrados: days.size, racha: streak })
}))

export default router
