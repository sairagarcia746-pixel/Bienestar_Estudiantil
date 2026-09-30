import { useState } from 'react'

const categories = ['Todos', 'Salud mental', 'Rendimiento', 'Motivación', 'Físico', 'Social']

const resources = [
  { id: 1, cat: 'Salud mental', icon: '🧘', title: 'Técnicas de respiración para el estrés', type: 'Guía', time: '5 min', color: 'var(--color-sky-light)', accent: 'var(--color-sky-calm)', desc: 'Pausa, inhala 4 segundos, sostén 4 y exhala 6. Repítelo cuando una entrega te abrume.' },
  { id: 2, cat: 'Rendimiento', icon: '📅', title: 'Cómo organizar tu tiempo de estudio', type: 'Artículo', time: '8 min', color: 'var(--color-emerald-light)', accent: 'var(--color-primary)', desc: 'Estudia 25 minutos y descansa 5. Tu cerebro consolida mejor con pausas cortas.' },
  { id: 3, cat: 'Motivación', icon: '🎯', title: 'Establece metas alcanzables', type: 'Guía', time: '6 min', color: 'var(--color-amber-light)', accent: 'var(--color-amber-warm)', desc: 'Una meta clara, medible y para esta semana pesa menos que un propósito enorme y vago.' },
  { id: 4, cat: 'Físico', icon: '🏃', title: 'Ejercicio y concentración', type: 'Infografía', time: '3 min', color: 'var(--color-coral-light)', accent: 'var(--color-coral)', desc: 'Treinta minutos de movimiento al día ayudan a la memoria y al ánimo.' },
  { id: 5, cat: 'Social', icon: '👫', title: 'Comunicación asertiva', type: 'Guía', time: '10 min', color: 'var(--color-sky-light)', accent: 'var(--color-sky-calm)', desc: 'Di lo que necesitas sin atacar: hecho, emoción y pedido concreto.' },
  { id: 6, cat: 'Salud mental', icon: '💤', title: 'La importancia del sueño', type: 'Artículo', time: '6 min', color: 'var(--color-emerald-light)', accent: 'var(--color-primary)', desc: 'Dormir cerca de 8 horas mejora la atención del día siguiente. Regístralo en Hábitos.' },
  { id: 7, cat: 'Motivación', icon: '✨', title: 'Después de un mal día', type: 'Guía', time: '4 min', color: 'var(--color-amber-light)', accent: 'var(--color-amber-warm)', desc: 'Un día difícil no borra tu progreso. Anota cómo te sentiste y vuelve mañana.' },
]

export default function ResourcesScreen() {
  const [cat, setCat] = useState('Todos')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(null)
  const filtered = resources.filter((item) =>
    (cat === 'Todos' || item.cat === cat) &&
    `${item.title} ${item.desc}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="px-5 py-6 animate-fade-in">
      <h2 className="font-display text-2xl font-bold mb-2">Recursos de bienestar</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--color-muted-foreground)' }}>Ideas cortas para cuidar tu día de estudio</p>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar recursos..." className="field mb-4" />
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {categories.map((item) => (
          <button key={item} onClick={() => setCat(item)} className="px-4 py-2 rounded-[var(--radius-full)] text-sm font-semibold whitespace-nowrap" style={{ background: cat === item ? 'var(--color-primary)' : 'var(--color-card)', color: cat === item ? 'white' : 'var(--color-muted-foreground)', border: `1px solid ${cat === item ? 'var(--color-primary)' : 'var(--color-border)'}` }}>
            {item}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((item) => (
          <article key={item.id} className="rounded-[var(--radius-xl)] p-5 card-shadow" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center text-2xl" style={{ background: item.color }}>{item.icon}</div>
              <div>
                <p className="text-[10px] font-semibold uppercase" style={{ color: item.accent }}>{item.type} · {item.time}</p>
                <h3 className="font-semibold text-sm">{item.title}</h3>
              </div>
            </div>
            <p className="text-xs leading-relaxed mt-3" style={{ color: 'var(--color-muted-foreground)' }}>{item.desc}</p>
            <button onClick={() => setOpen(open === item.id ? null : item.id)} className="mt-3 text-xs font-semibold" style={{ color: item.accent }}>
              {open === item.id ? 'Ocultar' : 'Leer guía'}
            </button>
            {open === item.id && (
              <p className="mt-3 text-sm leading-relaxed">{item.desc} Practícalo hoy y, si quieres, deja constancia en tus hábitos.</p>
            )}
          </article>
        ))}
        {filtered.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--color-muted-foreground)' }}>No se encontraron recursos</p>}
      </div>
    </div>
  )
}
