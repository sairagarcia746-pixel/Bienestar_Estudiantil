import { useEffect, useState } from 'react'
import { api, clearSession, flushQueue, savedUser, setSession } from './api'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import RecoverScreen from './screens/RecoverScreen'
import MainApp from './screens/MainApp'
import AdminApp from './screens/AdminApp'
import PWABadge from './PWABadge.jsx'

export default function App() {
  const [authScreen, setAuthScreen] = useState('login')
  const [user, setUser] = useState(savedUser)

  useEffect(() => {
    const logout = () => setUser(null)
    window.addEventListener('bienestar-unauthorized', logout)
    window.addEventListener('online', flushQueue)
    flushQueue()
    if (savedUser()) {
      api('/auth/me').then((data) => {
        localStorage.setItem('bienestar_user', JSON.stringify(data.user))
        setUser(data.user)
      }).catch(() => {})
    }
    return () => {
      window.removeEventListener('bienestar-unauthorized', logout)
      window.removeEventListener('online', flushQueue)
    }
  }, [])

  const login = async (correo, contrasena) => {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ correo, contrasena }) })
    setSession(data.token, data.user)
    setUser(data.user)
  }

  const register = async (form) => {
    const data = await api('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        contrasena: form.contrasena,
        fecha_nacimiento: form.fecha_nacimiento || null,
      }),
    })
    setSession(data.token, data.user)
    setUser(data.user)
  }

  const logout = () => {
    clearSession()
    setUser(null)
    setAuthScreen('login')
  }

  return (
    <>
      {!user && authScreen === 'login' && (
        <LoginScreen onLogin={login} onRegister={() => setAuthScreen('register')} onRecover={() => setAuthScreen('recover')} />
      )}
      {!user && authScreen === 'register' && (
        <RegisterScreen onBack={() => setAuthScreen('login')} onSubmit={register} />
      )}
      {!user && authScreen === 'recover' && (
        <RecoverScreen onBack={() => setAuthScreen('login')} />
      )}
      {user?.rol === 'administrador' && <AdminApp user={user} onLogout={logout} />}
      {user && user.rol !== 'administrador' && (
        <MainApp user={user} onLogout={logout} onUpdated={(next) => {
          localStorage.setItem('bienestar_user', JSON.stringify(next))
          setUser(next)
        }} />
      )}
      <PWABadge />
    </>
  )
}
