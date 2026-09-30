import { useEffect, useState } from 'react'
import { api, localDate } from '../api'
import BrandLogo from '../components/BrandLogo'
import HomeScreen from './HomeScreen'
import HabitsScreen from './HabitsScreen'
import EmotionScreen from './EmotionScreen'
import ResourcesScreen from './ResourcesScreen'
import ProfileScreen from './ProfileScreen'
import NotificationsScreen from './NotificationsScreen'

const tabs = [
  { id: 'home', label: 'Inicio', icon: '🏠', desc: 'Resumen del día' },
  { id: 'habits', label: 'Hábitos', icon: '📝', desc: 'Sueño, comida, agua y actividad' },
  { id: 'emotion', label: 'Cómo estoy', icon: '💚', desc: 'Estado emocional' },
  { id: 'resources', label: 'Recursos', icon: '📚', desc: 'Guías de bienestar' },
  { id: 'profile', label: 'Perfil', icon: '👤', desc: 'Mi cuenta' },
]

export default function MainApp({ user, onLogout, onUpdated }) {
  const [tab, setTab] = useState('home')
  const [showNotifs, setShowNotifs] = useState(false)
  const [dashboard, setDashboard] = useState(null)
  const [notifs, setNotifs] = useState([])
  const [tick, setTick] = useState(0)
  const active = tabs.find((item) => item.id === tab)

  useEffect(() => {
    const fecha = localDate()
    api(`/dashboard?fecha=${fecha}`).then(setDashboard).catch(() => {})
    api(`/notificaciones?fecha=${fecha}`).then((data) => setNotifs(data.notificaciones || [])).catch(() => {})
  }, [tick])

  const refresh = () => setTick((value) => value + 1)

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-background)' }}>
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 fixed left-0 top-0 bottom-0 z-30" style={{ background: 'var(--color-emerald-deep)' }}>
        <div className="px-6 pt-8 pb-6"><BrandLogo variant="compact" light /></div>
        <div className="px-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)]" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-bold">{user.nombre.slice(0, 1)}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user.nombre} {user.apellido}</div>
              <div className="text-xs text-white/60">Estudiante</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {tabs.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className="w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] text-left" style={{ background: tab === item.id ? 'rgba(255,255,255,0.18)' : 'transparent', color: tab === item.id ? '#fff' : 'rgba(255,255,255,0.65)' }}>
              <span className="text-xl w-7 text-center">{item.icon}</span>
              <span>
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="block text-[10px] text-white/50">{item.desc}</span>
              </span>
            </button>
          ))}
        </nav>
        <div className="px-4 pb-8 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-white/70 text-sm font-semibold">
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col lg:ml-64 xl:ml-72 min-w-0">
        <header className="sticky top-0 z-40 glass flex items-center justify-between px-4 sm:px-6 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="lg:hidden"><BrandLogo variant="compact" /></div>
          <div className="hidden lg:block">
            <h1 className="font-display text-lg font-bold leading-none">{active.icon} {active.label}</h1>
            <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{active.desc}</p>
          </div>
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="w-10 h-10 rounded-full" aria-label="Recordatorios">
              <span className="text-xl">🔔</span>
              {notifs.some((item) => item.unread) && (
                <span className="absolute top-0 right-0 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: 'var(--color-coral)' }}>
                  {notifs.filter((item) => item.unread).length}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute top-12 right-0 w-80 rounded-[var(--radius-xl)] card-shadow-lg overflow-hidden z-50" style={{ background: 'var(--color-card)' }}>
                <NotificationsScreen items={notifs} onClose={() => setShowNotifs(false)} />
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
          <div className="max-w-4xl mx-auto">
            {tab === 'home' && <HomeScreen user={user} dashboard={dashboard} onTabChange={setTab} />}
            {tab === 'habits' && <HabitsScreen onChange={refresh} />}
            {tab === 'emotion' && <EmotionScreen onChange={refresh} />}
            {tab === 'resources' && <ResourcesScreen />}
            {tab === 'profile' && <ProfileScreen user={user} onLogout={onLogout} onUpdated={onUpdated} />}
          </div>
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="flex max-w-2xl mx-auto">
          {tabs.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className="flex-1 flex flex-col items-center gap-1 py-3" style={{ color: tab === item.id ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
