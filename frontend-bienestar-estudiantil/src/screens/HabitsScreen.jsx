import { useEffect, useState } from 'react'
import { api, localDate } from '../api'

const kinds = [
  { id: 'sueno', label: 'Sueño', icon: '😴' },
  { id: 'alimentacion', label: 'Comidas', icon: '🍽️' },
  { id: 'hidratacion', label: 'Agua', icon: '💧' },
  { id: 'actividad', label: 'Actividad', icon: '🏃' },
]

const today = () => localDate()

export default function HabitsScreen({ onChange }) {
  const [kind, setKind] = useState('sueno')
  const [records, setRecords] = useState([])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async (selected = kind) => {
    const desde = new Date()
    desde.setDate(desde.getDate() - 30)
    const data = await api(`/habitos/${selected}?desde=${localDate(desde)}&hasta=${today()}`)
    setRecords(data.registros || [])
  }

  useEffect(() => {
    load(kind).catch((err) => setError(err.message))
  }, [kind])

  const save = async (payload) => {
    setError('')
    setNotice('')
    const path = editing ? `/habitos/${kind}/${editing.id}` : `/habitos/${kind}`
    const result = await api(path, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) })
    if (result.offline) setNotice('Sin conexión. El registro se enviará cuando vuelva internet.')
    setEditing(null)
    await load(kind)
    onChange?.()
  }

  const remove = async (id) => {
    setError('')
    await api(`/habitos/${kind}/${id}`, { method: 'DELETE' })
    await load(kind)
    onChange?.()
  }

  return (
    <div className="px-4 sm:px-6 py-6 animate-fade-in">
      <h2 className="font-display text-2xl font-bold mb-1">Hábitos diarios</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--color-muted-foreground)' }}>
        Sueño, comidas, agua y actividad. Puedes corregir o borrar tus propios registros.
      </p>
      <div className="grid grid-cols-4 gap-2 mb-5">
        {kinds.map((item) => (
          <button key={item.id} onClick={() => { setKind(item.id); setEditing(null) }} className="py-3 rounded-[var(--radius-lg)] text-xs font-semibold" style={{ background: kind === item.id ? 'var(--color-primary)' : 'var(--color-card)', color: kind === item.id ? 'white' : 'var(--color-foreground)', border: '1px solid var(--color-border)' }}>
            <div className="text-lg">{item.icon}</div>
            {item.label}
          </button>
        ))}
      </div>
      {error && <p className="mb-4 text-sm px-4 py-3 rounded-[var(--radius-md)]" style={{ background: 'var(--color-rose-light)', color: 'var(--color-rose-soft)' }}>{error}</p>}
      {notice && <p className="mb-4 text-sm px-4 py-3 rounded-[var(--radius-md)]" style={{ background: 'var(--color-amber-light)', color: 'var(--color-amber-warm)' }}>{notice}</p>}
      <HabitForm kind={kind} editing={editing} onCancel={() => setEditing(null)} onSave={save} onError={setError} />
      <div className="mt-5 space-y-3">
        {records.length === 0 && <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>No hay registros en los últimos 30 días.</p>}
        {records.map((record) => (
          <article key={recordId(kind, record)} className="p-4 rounded-[var(--radius-lg)] flex items-center gap-3" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{summary(kind, record)}</p>
              <p className="text-xs font-mono" style={{ color: 'var(--color-muted-foreground)' }}>{String(record.fecha).slice(0, 10)}</p>
            </div>
            <button onClick={() => setEditing(record)} className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>Editar</button>
            <button onClick={() => remove(recordId(kind, record))} className="text-xs font-semibold" style={{ color: 'var(--color-rose-soft)' }}>Eliminar</button>
          </article>
        ))}
      </div>
    </div>
  )
}

function recordId(kind, record) {
  return record[{ sueno: 'id_sueno', alimentacion: 'id_alimentacion', hidratacion: 'id_hidratacion', actividad: 'id_actividad' }[kind]]
}

function summary(kind, record) {
  if (kind === 'sueno') return `${String(record.hora_dormir).slice(0, 5)} – ${String(record.hora_despertar).slice(0, 5)} · ${record.horas_totales} h · ${record.calidad_sueno || 'sin calidad'}`
  if (kind === 'alimentacion') return `${record.tipo_comida} · ${record.descripcion || 'sin descripción'}`
  if (kind === 'hidratacion') return `${record.cantidad_ml} ml · ${record.hora_registro ? String(record.hora_registro).slice(0, 5) : 'sin hora'}`
  return `${record.tipo_actividad} · ${record.duracion_minutos} min · ${record.intensidad}`
}

function HabitForm({ kind, editing, onSave, onCancel, onError }) {
  const [form, setForm] = useState(emptyForm(kind))

  useEffect(() => {
    setForm(editing ? fromRecord(kind, editing) : emptyForm(kind))
  }, [kind, editing])

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    try {
      await onSave(payload(kind, form))
      if (!editing) setForm(emptyForm(kind))
    } catch (error) {
      onError(error.message)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-xl)] p-5 space-y-3" style={{ background: 'var(--color-card)' }}>
      <h3 className="font-semibold text-sm">{editing ? 'Editar registro' : 'Nuevo registro'}</h3>
      <label className="block text-xs font-semibold uppercase" style={{ color: 'var(--color-muted-foreground)' }}>Fecha</label>
      <input type="date" required value={form.fecha} onChange={(e) => set('fecha', e.target.value)} className="field" />
      {kind === 'sueno' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Time label="Dormir" value={form.hora_dormir} onChange={(value) => set('hora_dormir', value)} />
            <Time label="Despertar" value={form.hora_despertar} onChange={(value) => set('hora_despertar', value)} />
          </div>
          <Select label="Calidad" value={form.calidad_sueno} onChange={(value) => set('calidad_sueno', value)} options={['buena', 'regular', 'mala']} />
        </>
      )}
      {kind === 'alimentacion' && (
        <>
          <Select label="Tipo" value={form.tipo_comida} onChange={(value) => set('tipo_comida', value)} options={['desayuno', 'almuerzo', 'cena', 'snack']} />
          <input value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} placeholder="Qué comiste" className="field" maxLength={255} />
        </>
      )}
      {kind === 'hidratacion' && (
        <div className="grid grid-cols-2 gap-3">
          <input type="number" min="1" max="5000" required value={form.cantidad_ml} onChange={(e) => set('cantidad_ml', e.target.value)} placeholder="ml" className="field" />
          <Time label="Hora" value={form.hora_registro} onChange={(value) => set('hora_registro', value)} />
        </div>
      )}
      {kind === 'actividad' && (
        <>
          <input required value={form.tipo_actividad} onChange={(e) => set('tipo_actividad', e.target.value)} placeholder="Caminata, fútbol, baile..." className="field" maxLength={50} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" min="1" max="600" required value={form.duracion_minutos} onChange={(e) => set('duracion_minutos', e.target.value)} placeholder="Minutos" className="field" />
            <Select label="Intensidad" value={form.intensidad} onChange={(value) => set('intensidad', value)} options={['baja', 'media', 'alta']} />
          </div>
        </>
      )}
      <div className="flex gap-2">
        {editing && <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-[var(--radius-md)] border text-sm font-semibold" style={{ borderColor: 'var(--color-border)' }}>Cancelar</button>}
        <button type="submit" className="flex-1 py-3 rounded-[var(--radius-md)] text-sm font-semibold" style={{ background: 'var(--color-primary)', color: 'white' }}>
          {editing ? 'Guardar cambios' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

function Time({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--color-muted-foreground)' }}>{label}</span>
      <input type="time" required value={value} onChange={(e) => onChange(e.target.value)} className="field" />
    </label>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--color-muted-foreground)' }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function emptyForm(kind) {
  const base = { fecha: today().slice(0, 10) }
  if (kind === 'sueno') return { ...base, hora_dormir: '23:00', hora_despertar: '07:00', calidad_sueno: 'buena' }
  if (kind === 'alimentacion') return { ...base, tipo_comida: 'desayuno', descripcion: '' }
  if (kind === 'hidratacion') return { ...base, cantidad_ml: 250, hora_registro: new Date().toTimeString().slice(0, 5) }
  return { ...base, tipo_actividad: '', duracion_minutos: 30, intensidad: 'media' }
}

function fromRecord(kind, record) {
  const fecha = String(record.fecha).slice(0, 10)
  if (kind === 'sueno') return { fecha, hora_dormir: String(record.hora_dormir).slice(0, 5), hora_despertar: String(record.hora_despertar).slice(0, 5), calidad_sueno: record.calidad_sueno || 'buena' }
  if (kind === 'alimentacion') return { fecha, tipo_comida: record.tipo_comida, descripcion: record.descripcion || '' }
  if (kind === 'hidratacion') return { fecha, cantidad_ml: record.cantidad_ml, hora_registro: record.hora_registro ? String(record.hora_registro).slice(0, 5) : '' }
  return { fecha, tipo_actividad: record.tipo_actividad, duracion_minutos: record.duracion_minutos, intensidad: record.intensidad }
}

function payload(kind, form) {
  if (kind === 'hidratacion') return { ...form, cantidad_ml: Number(form.cantidad_ml) }
  if (kind === 'actividad') return { ...form, duracion_minutos: Number(form.duracion_minutos) }
  return form
}
