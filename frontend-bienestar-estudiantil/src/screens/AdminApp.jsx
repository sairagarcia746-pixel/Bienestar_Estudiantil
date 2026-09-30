import { useEffect, useState } from 'react'
import { api } from '../api'
import BrandLogo from '../components/BrandLogo'

export default function AdminApp({ user, onLogout }) {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/admin/estadisticas').then(setStats).catch((err) => setError(err.message))
  }, [])

  const totalAnimo = stats?.animo.reduce((sum, item) => sum + item.total, 0) || 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <header className="sticky top-0 z-40 glass px-4 sm:px-6 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <BrandLogo variant="compact" />
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: 'var(--color-amber-light)', color: 'var(--color-amber-warm)' }}>ADMIN</span>
          <button onClick={onLogout} className="text-xs font-semibold px-3 py-1.5 rounded-full border" style={{ borderColor: 'var(--color-border)' }}>Salir</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Panel administrativo</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
            {user.nombre}, estos datos están agregados. No incluyen nombres ni correos de estudiantes.
          </p>
        </div>
        {error && <p className="text-sm" style={{ color: 'var(--color-rose-soft)' }}>{error}</p>}
        {stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card label="Estudiantes" value={stats.estudiantes} tone="emerald" />
              <Card label="Activos en 7 días" value={stats.activos_semana} tone="sky" />
              <Card label="Sueño promedio" value={stats.promedio_sueno == null ? '—' : `${stats.promedio_sueno} h`} tone="amber" />
              <Card label="Agua diaria prom." value={`${stats.promedio_agua} ml`} tone="rose" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <section className="rounded-[var(--radius-xl)] p-5" style={{ background: 'var(--color-card)' }}>
                <h2 className="font-semibold text-sm mb-4">Registros de la última semana</h2>
                {Object.entries({
                  Sueño: stats.registros_semana.sueno,
                  Alimentación: stats.registros_semana.alimentacion,
                  Hidratación: stats.registros_semana.hidratacion,
                  Actividad: stats.registros_semana.actividad,
                  Emocional: stats.registros_semana.emocional,
                }).map(([label, value]) => (
                  <Bar key={label} label={label} value={value} max={Math.max(...Object.values(stats.registros_semana), 1)} />
                ))}
              </section>
              <section className="rounded-[var(--radius-xl)] p-5" style={{ background: 'var(--color-card)' }}>
                <h2 className="font-semibold text-sm mb-4">Estados de ánimo</h2>
                {stats.animo.length === 0 && <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Todavía no hay registros emocionales.</p>}
                {stats.animo.map((item) => (
                  <Bar key={item.estado_animo} label={item.estado_animo} value={item.total} max={totalAnimo || 1} suffix={`${Math.round((item.total / (totalAnimo || 1)) * 100)}%`} />
                ))}
                <p className="text-xs mt-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  {stats.estudiantes_activos_fisicos} estudiantes distintos registraron actividad física · {stats.minutos_actividad} minutos en total.
                </p>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function Card({ label, value, tone }) {
  const tones = {
    emerald: ['var(--color-emerald-light)', 'var(--color-primary)'],
    sky: ['var(--color-sky-light)', 'var(--color-sky-calm)'],
    amber: ['var(--color-amber-light)', 'var(--color-amber-warm)'],
    rose: ['var(--color-rose-light)', 'var(--color-rose-soft)'],
  }
  const [background, color] = tones[tone]
  return (
    <div className="p-4 rounded-[var(--radius-xl)]" style={{ background }}>
      <div className="font-display text-3xl font-bold mb-1" style={{ color }}>{value}</div>
      <div className="text-xs font-medium" style={{ color }}>{label}</div>
    </div>
  )
}

function Bar({ label, value, max, suffix }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs w-28 capitalize" style={{ color: 'var(--color-muted-foreground)' }}>{label}</span>
      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-muted)' }}>
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: 'var(--color-primary)' }} />
      </div>
      <span className="font-mono text-xs w-10 text-right">{suffix || value}</span>
    </div>
  )
}
