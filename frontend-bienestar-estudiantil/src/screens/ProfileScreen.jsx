import { useEffect, useState } from 'react'
import { api } from '../api'

export default function ProfileScreen({ user, onLogout, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [nombre, setNombre] = useState(user.nombre)
  const [apellido, setApellido] = useState(user.apellido)
  const [fecha, setFecha] = useState(user.fecha_nacimiento ? String(user.fecha_nacimiento).slice(0, 10) : '')
  const [stats, setStats] = useState({ dias_registrados: 0, racha: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    api('/dashboard/perfil').then(setStats).catch(() => {})
  }, [])

  const save = async () => {
    setError('')
    try {
      const data = await api('/auth/perfil', {
        method: 'PUT',
        body: JSON.stringify({ nombre, apellido, fecha_nacimiento: fecha || null }),
      })
      onUpdated(data.user)
      setEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="px-5 py-6 animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-[var(--radius-xl)] flex items-center justify-center text-2xl font-bold text-white" style={{ background: 'var(--color-primary)' }}>
          {user.nombre.slice(0, 1)}{user.apellido.slice(0, 1)}
        </div>
        <div>
          <h2 className="font-display text-xl font-bold">{user.nombre} {user.apellido}</h2>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>{user.correo}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'var(--color-emerald-light)', color: 'var(--color-primary)' }}>
            {user.rol === 'administrador' ? 'Administrador' : 'Estudiante'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Días registrados" value={stats.dias_registrados} />
        <Stat label="Racha actual" value={stats.racha} />
      </div>

      <div className="rounded-[var(--radius-xl)] p-5" style={{ background: 'var(--color-card)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Información personal</h3>
          {!editing && <button onClick={() => setEditing(true)} className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>Editar</button>}
        </div>
        {error && <p className="text-sm mb-3" style={{ color: 'var(--color-rose-soft)' }}>{error}</p>}
        {editing ? (
          <div className="space-y-3">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="field" placeholder="Nombre" />
            <input value={apellido} onChange={(e) => setApellido(e.target.value)} className="field" placeholder="Apellido" />
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="field" />
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-[var(--radius-md)] border text-sm font-semibold" style={{ borderColor: 'var(--color-border)' }}>Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold text-white" style={{ background: 'var(--color-primary)' }}>Guardar</button>
            </div>
          </div>
        ) : (
          <dl className="space-y-2 text-sm">
            <Info label="Nombre" value={`${user.nombre} ${user.apellido}`} />
            <Info label="Correo" value={user.correo} />
            <Info label="Nacimiento" value={fecha || 'Sin registrar'} />
          </dl>
        )}
      </div>

      <button onClick={onLogout} className="w-full py-4 rounded-[var(--radius-lg)] font-semibold text-sm border" style={{ borderColor: 'var(--color-rose-soft)', color: 'var(--color-rose-soft)' }}>
        Cerrar sesión
      </button>
      <p className="text-center text-xs" style={{ color: 'var(--color-muted-foreground)' }}>BienEstar · PWA de hábitos estudiantiles</p>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="p-4 rounded-[var(--radius-lg)] text-center" style={{ background: 'var(--color-card)' }}>
      <div className="font-display text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{value}</div>
      <div className="text-[10px] font-semibold uppercase" style={{ color: 'var(--color-muted-foreground)' }}>{label}</div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <dt style={{ color: 'var(--color-muted-foreground)' }}>{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
