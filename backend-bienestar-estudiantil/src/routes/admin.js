import { Router } from 'express'
import { pool } from '../db.js'
import { asyncHandler, requireAdmin, requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/estadisticas', asyncHandler(async (_req, res) => {
  const [[estudiantes]] = await pool.query(
    "SELECT COUNT(*) AS total FROM usuario WHERE rol = 'estudiante'",
  )
  const [[activos]] = await pool.query(
    `SELECT COUNT(DISTINCT id_usuario) AS total FROM (
       SELECT id_usuario FROM registro_sueno WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       UNION SELECT id_usuario FROM registro_alimentacion WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       UNION SELECT id_usuario FROM registro_hidratacion WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       UNION SELECT id_usuario FROM registro_actividad_fisica WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       UNION SELECT id_usuario FROM registro_emocional WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
     ) activos`,
  )
  const [[sueno]] = await pool.query(
    `SELECT ROUND(AVG(horas_totales), 1) AS promedio, COUNT(*) AS total
     FROM registro_sueno WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
  )
  const [[agua]] = await pool.query(
    `SELECT ROUND(AVG(diario), 0) AS promedio, COALESCE(SUM(diario), 0) AS total FROM (
       SELECT SUM(cantidad_ml) AS diario
       FROM registro_hidratacion
       WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY id_usuario, fecha
     ) dias`,
  )
  const [[actividad]] = await pool.query(
    `SELECT COUNT(DISTINCT id_usuario) AS estudiantes, COALESCE(SUM(duracion_minutos), 0) AS minutos
     FROM registro_actividad_fisica
     WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
  )
  const counts = {}
  for (const [key, table] of [
    ['sueno', 'registro_sueno'],
    ['alimentacion', 'registro_alimentacion'],
    ['hidratacion', 'registro_hidratacion'],
    ['actividad', 'registro_actividad_fisica'],
    ['emocional', 'registro_emocional'],
  ]) {
    const [[row]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${table} WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
    )
    counts[key] = Number(row.total)
  }
  const [animo] = await pool.query(
    `SELECT estado_animo, COUNT(*) AS total
     FROM registro_emocional
     WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
     GROUP BY estado_animo
     ORDER BY total DESC`,
  )

  res.json({
    estudiantes: Number(estudiantes.total),
    activos_semana: Number(activos.total),
    promedio_sueno: sueno.promedio == null ? null : Number(sueno.promedio),
    registros_sueno: Number(sueno.total),
    promedio_agua: agua.promedio == null ? 0 : Number(agua.promedio),
    estudiantes_activos_fisicos: Number(actividad.estudiantes),
    minutos_actividad: Number(actividad.minutos),
    registros_semana: counts,
    animo: animo.map((row) => ({ estado_animo: row.estado_animo, total: Number(row.total) })),
  })
}))

export default router
