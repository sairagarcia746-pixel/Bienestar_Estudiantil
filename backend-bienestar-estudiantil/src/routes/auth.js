import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../db.js'
import { asyncHandler, publicUser, requireAuth, signToken } from '../middleware/auth.js'

const router = Router()

function badRequest(message) {
  const error = new Error(message)
  error.status = 400
  return error
}

router.post('/registro', asyncHandler(async (req, res) => {
  const nombre = String(req.body.nombre || '').trim()
  const apellido = String(req.body.apellido || '').trim()
  const correo = String(req.body.correo || '').trim().toLowerCase()
  const contrasena = String(req.body.contrasena || '')
  const fechaNacimiento = req.body.fecha_nacimiento || null

  if (!nombre || !apellido || !correo || !contrasena) {
    throw badRequest('Nombre, apellido, correo y contraseña son obligatorios')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    throw badRequest('El correo no tiene un formato válido')
  }
  if (contrasena.length < 8) {
    throw badRequest('La contraseña debe tener al menos 8 caracteres')
  }
  if (fechaNacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
    throw badRequest('La fecha de nacimiento no es válida')
  }

  const [existing] = await pool.query('SELECT id_usuario FROM usuario WHERE correo = ?', [correo])
  if (existing.length) {
    const error = new Error('Ya existe una cuenta con ese correo')
    error.status = 409
    throw error
  }

  const hash = await bcrypt.hash(contrasena, 10)
  const [result] = await pool.query(
    `INSERT INTO usuario (nombre, apellido, correo, contrasena, fecha_nacimiento, rol)
     VALUES (?, ?, ?, ?, ?, 'estudiante')`,
    [nombre, apellido, correo, hash, fechaNacimiento],
  )
  const [rows] = await pool.query(
    'SELECT id_usuario, nombre, apellido, correo, fecha_nacimiento, fecha_registro, rol FROM usuario WHERE id_usuario = ?',
    [result.insertId],
  )
  const user = publicUser(rows[0])
  res.status(201).json({ token: signToken(rows[0]), user })
}))

router.post('/login', asyncHandler(async (req, res) => {
  const correo = String(req.body.correo || '').trim().toLowerCase()
  const contrasena = String(req.body.contrasena || '')
  if (!correo || !contrasena) throw badRequest('Completa correo y contraseña')

  const [rows] = await pool.query(
    'SELECT id_usuario, nombre, apellido, correo, contrasena, fecha_nacimiento, fecha_registro, rol FROM usuario WHERE correo = ?',
    [correo],
  )
  const row = rows[0]
  const valid = row ? await bcrypt.compare(contrasena, row.contrasena) : false
  if (!valid) {
    const error = new Error('Correo o contraseña incorrectos')
    error.status = 401
    throw error
  }
  res.json({ token: signToken(row), user: publicUser(row) })
}))

router.post('/recuperar', asyncHandler(async (_req, res) => {
  res.json({
    message: 'Si el correo está registrado, el equipo de bienestar de tu institución puede ayudarte a restablecer el acceso. Esta versión no envía correos automáticos.',
  })
}))

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id_usuario, nombre, apellido, correo, fecha_nacimiento, fecha_registro, rol FROM usuario WHERE id_usuario = ?',
    [req.user.id],
  )
  if (!rows[0]) {
    const error = new Error('Usuario no encontrado')
    error.status = 404
    throw error
  }
  res.json({ user: publicUser(rows[0]) })
}))

router.put('/perfil', requireAuth, asyncHandler(async (req, res) => {
  const nombre = String(req.body.nombre || '').trim()
  const apellido = String(req.body.apellido || '').trim()
  const fechaNacimiento = req.body.fecha_nacimiento || null
  if (!nombre || !apellido) throw badRequest('Nombre y apellido son obligatorios')
  if (fechaNacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
    throw badRequest('La fecha de nacimiento no es válida')
  }
  await pool.query(
    'UPDATE usuario SET nombre = ?, apellido = ?, fecha_nacimiento = ? WHERE id_usuario = ?',
    [nombre, apellido, fechaNacimiento, req.user.id],
  )
  const [rows] = await pool.query(
    'SELECT id_usuario, nombre, apellido, correo, fecha_nacimiento, fecha_registro, rol FROM usuario WHERE id_usuario = ?',
    [req.user.id],
  )
  res.json({ user: publicUser(rows[0]) })
}))

export default router
