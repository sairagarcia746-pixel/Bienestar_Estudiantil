import jwt from 'jsonwebtoken'

export function signToken(user) {
  return jwt.sign(
    { id: user.id_usuario, rol: user.rol, correo: user.correo },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    const error = new Error('Debes iniciar sesión')
    error.status = 401
    return next(error)
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    const error = new Error('Sesión inválida o vencida')
    error.status = 401
    next(error)
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.rol !== 'administrador') {
    const error = new Error('No tienes permiso para ver este reporte')
    error.status = 403
    return next(error)
  }
  next()
}

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

export function publicUser(row) {
  return {
    id: row.id_usuario,
    nombre: row.nombre,
    apellido: row.apellido,
    correo: row.correo,
    fecha_nacimiento: row.fecha_nacimiento,
    fecha_registro: row.fecha_registro,
    rol: row.rol,
  }
}
