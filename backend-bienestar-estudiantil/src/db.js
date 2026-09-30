import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const pool = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  port: Number(process.env.MYSQL_ADDON_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'Z',
  dateStrings: true,
})

pool.on('connection', (connection) => {
  connection.query("SET time_zone = '-05:00'")
})

export async function initDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf8')
  const statements = schema
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)

  const connection = await pool.getConnection()
  try {
    for (const statement of statements) {
      await connection.query(statement)
    }
  } finally {
    connection.release()
  }

  const email = process.env.ADMIN_EMAIL || 'admin@edu.co'
  const [rows] = await pool.query('SELECT id_usuario FROM usuario WHERE correo = ?', [email])
  if (rows.length === 0) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'BienestarAdmin2026', 10)
    await pool.query(
      `INSERT INTO usuario (nombre, apellido, correo, contrasena, rol)
       VALUES (?, ?, ?, ?, 'administrador')`,
      [
        process.env.ADMIN_NOMBRE || 'Administrador',
        process.env.ADMIN_APELLIDO || 'Bienestar',
        email,
        hash,
      ],
    )
  }
}
