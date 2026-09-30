import { Router } from 'express'
import { pool } from '../db.js'
import { asyncHandler, requireAuth } from '../middleware/auth.js'

function badRequest(message) {
  const error = new Error(message)
  error.status = 400
  return error
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '')
}

function normalizeTime(value) {
  if (!value) return null
  const match = String(value).match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3] || 0)
  if (hours > 23 || minutes > 59 || seconds > 59) return null
  return `${match[1]}:${match[2]}:${String(seconds).padStart(2, '0')}`
}

function hoursBetween(sleep, wake) {
  const [sh, sm] = sleep.split(':').map(Number)
  const [wh, wm] = wake.split(':').map(Number)
  let start = sh * 60 + sm
  let end = wh * 60 + wm
  if (end <= start) end += 24 * 60
  return Math.round(((end - start) / 60) * 100) / 100
}

const resources = {
  sueno: {
    table: 'registro_sueno',
    id: 'id_sueno',
    columns: ['fecha', 'hora_dormir', 'hora_despertar', 'horas_totales', 'calidad_sueno'],
    prepare(body) {
      const fecha = body.fecha
      const horaDormir = normalizeTime(body.hora_dormir)
      const horaDespertar = normalizeTime(body.hora_despertar)
      const calidad = body.calidad_sueno || null
      if (!isDate(fecha) || !horaDormir || !horaDespertar) {
        throw badRequest('Fecha y horas de dormir y despertar son obligatorias')
      }
      if (calidad && !['buena', 'regular', 'mala'].includes(calidad)) {
        throw badRequest('La calidad del sueño debe ser buena, regular o mala')
      }
      return {
        fecha,
        hora_dormir: horaDormir,
        hora_despertar: horaDespertar,
        horas_totales: hoursBetween(horaDormir, horaDespertar),
        calidad_sueno: calidad,
      }
    },
  },
  alimentacion: {
    table: 'registro_alimentacion',
    id: 'id_alimentacion',
    columns: ['fecha', 'tipo_comida', 'descripcion'],
    prepare(body) {
      const fecha = body.fecha
      const tipo = String(body.tipo_comida || '').toLowerCase()
      const descripcion = String(body.descripcion || '').trim().slice(0, 255)
      if (!isDate(fecha) || !['desayuno', 'almuerzo', 'cena', 'snack'].includes(tipo)) {
        throw badRequest('Indica la fecha y el tipo de comida')
      }
      return { fecha, tipo_comida: tipo, descripcion: descripcion || null }
    },
  },
  hidratacion: {
    table: 'registro_hidratacion',
    id: 'id_hidratacion',
    columns: ['fecha', 'cantidad_ml', 'hora_registro'],
    prepare(body) {
      const fecha = body.fecha
      const cantidad = Number(body.cantidad_ml)
      const hora = body.hora_registro ? normalizeTime(body.hora_registro) : null
      if (!isDate(fecha) || !Number.isInteger(cantidad) || cantidad <= 0 || cantidad > 5000) {
        throw badRequest('Indica una cantidad de agua entre 1 y 5000 ml')
      }
      if (body.hora_registro && !hora) throw badRequest('La hora de registro no es válida')
      return { fecha, cantidad_ml: cantidad, hora_registro: hora }
    },
  },
  actividad: {
    table: 'registro_actividad_fisica',
    id: 'id_actividad',
    columns: ['fecha', 'tipo_actividad', 'duracion_minutos', 'intensidad'],
    prepare(body) {
      const fecha = body.fecha
      const tipo = String(body.tipo_actividad || '').trim().slice(0, 50)
      const duracion = Number(body.duracion_minutos)
      const intensidad = String(body.intensidad || '').toLowerCase()
      if (!isDate(fecha) || !tipo) throw badRequest('Fecha y tipo de actividad son obligatorios')
      if (!Number.isInteger(duracion) || duracion <= 0 || duracion > 600) {
        throw badRequest('La duración debe estar entre 1 y 600 minutos')
      }
      if (!['baja', 'media', 'alta'].includes(intensidad)) {
        throw badRequest('La intensidad debe ser baja, media o alta')
      }
      return { fecha, tipo_actividad: tipo, duracion_minutos: duracion, intensidad }
    },
  },
  emocional: {
    table: 'registro_emocional',
    id: 'id_emocional',
    columns: ['fecha', 'estado_animo', 'nivel_estres', 'notas'],
    prepare(body) {
      const fecha = body.fecha
      const estado = String(body.estado_animo || '').trim().slice(0, 30)
      const estres = Number(body.nivel_estres)
      const notas = String(body.notas || '').trim().slice(0, 255)
      if (!isDate(fecha) || !estado) throw badRequest('Fecha y estado de ánimo son obligatorios')
      if (!Number.isInteger(estres) || estres < 1 || estres > 5) {
        throw badRequest('El nivel de estrés debe estar entre 1 y 5')
      }
      return { fecha, estado_animo: estado, nivel_estres: estres, notas: notas || null }
    },
  },
}

const router = Router()
router.use(requireAuth)

for (const [name, config] of Object.entries(resources)) {
  router.get(`/${name}`, asyncHandler(async (req, res) => {
    const params = [req.user.id]
    let sql = `SELECT ${config.id}, ${config.columns.join(', ')} FROM ${config.table} WHERE id_usuario = ?`
    if (req.query.desde) {
      if (!isDate(req.query.desde)) throw badRequest('La fecha inicial no es válida')
      sql += ' AND fecha >= ?'
      params.push(req.query.desde)
    }
    if (req.query.hasta) {
      if (!isDate(req.query.hasta)) throw badRequest('La fecha final no es válida')
      sql += ' AND fecha <= ?'
      params.push(req.query.hasta)
    }
    sql += ` ORDER BY fecha DESC, ${config.id} DESC`
    const [rows] = await pool.query(sql, params)
    res.json({ registros: rows })
  }))

  router.post(`/${name}`, asyncHandler(async (req, res) => {
    const data = config.prepare(req.body || {})
    const columns = ['id_usuario', ...Object.keys(data)]
    const values = [req.user.id, ...Object.values(data)]
    const [result] = await pool.query(
      `INSERT INTO ${config.table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      values,
    )
    res.status(201).json({ id: result.insertId, ...data })
  }))

  router.put(`/${name}/:id`, asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) throw badRequest('Identificador inválido')
    const data = config.prepare(req.body || {})
    const assignments = Object.keys(data).map((column) => `${column} = ?`)
    const [result] = await pool.query(
      `UPDATE ${config.table} SET ${assignments.join(', ')} WHERE ${config.id} = ? AND id_usuario = ?`,
      [...Object.values(data), id, req.user.id],
    )
    if (!result.affectedRows) {
      const error = new Error('Registro no encontrado')
      error.status = 404
      throw error
    }
    res.json({ id, ...data })
  }))

  router.delete(`/${name}/:id`, asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const [result] = await pool.query(
      `DELETE FROM ${config.table} WHERE ${config.id} = ? AND id_usuario = ?`,
      [id, req.user.id],
    )
    if (!result.affectedRows) {
      const error = new Error('Registro no encontrado')
      error.status = 404
      throw error
    }
    res.json({ ok: true })
  }))
}

export default router
