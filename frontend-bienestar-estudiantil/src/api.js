const API = import.meta.env.VITE_API_URL || '/api'

export function localDate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
const QUEUE_KEY = 'bienestar_offline_queue'

export function getToken() {
  return localStorage.getItem('bienestar_token')
}

export function setSession(token, user) {
  localStorage.setItem('bienestar_token', token)
  localStorage.setItem('bienestar_user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('bienestar_token')
  localStorage.removeItem('bienestar_user')
}

export function savedUser() {
  const raw = localStorage.getItem('bienestar_user')
  return raw ? JSON.parse(raw) : null
}

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeQueue(items) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
}

export function queueOffline(item) {
  const queue = readQueue()
  queue.push({ ...item, id: Date.now() })
  writeQueue(queue)
}

export async function flushQueue() {
  if (!navigator.onLine || !getToken()) return
  const pending = readQueue()
  const remaining = []
  for (const item of pending) {
    try {
      const response = await fetch(`${API}${item.path}`, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: item.body,
      })
      if (!response.ok && response.status >= 500) remaining.push(item)
    } catch {
      remaining.push(item)
      break
    }
  }
  writeQueue(remaining)
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const method = options.method || 'GET'

  try {
    const response = await fetch(`${API}${path}`, { ...options, headers })
    const data = await response.json().catch(() => ({}))
    if (response.status === 401 && path !== '/auth/login') {
      clearSession()
      window.dispatchEvent(new Event('bienestar-unauthorized'))
    }
    if (!response.ok) {
      const error = new Error(data.message || 'No se pudo completar la solicitud')
      error.status = response.status
      throw error
    }
    return data
  } catch (error) {
    const offline = !navigator.onLine || error instanceof TypeError
    if (offline && method !== 'GET') {
      queueOffline({ path, method, body: options.body })
      return { offline: true }
    }
    if (offline) throw new Error('Sin conexión. Los datos guardados se sincronizan al volver internet.')
    throw error
  }
}
