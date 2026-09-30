const MOODS = {
  triste: '😢',
  ansioso: '😔',
  neutral: '😐',
  bien: '🙂',
  feliz: '😊',
  motivado: '🤩',
}

const messages = [
  { text: 'Cada día que registras un hábito es una victoria. Sigue adelante.', author: 'Comunidad BienEstar' },
  { text: 'Tu bienestar importa tanto como tus notas. Cuídate.', author: 'Orientación Escolar' },
  { text: 'Dormir, hidratarte y moverte también es estudiar mejor.', author: 'Psicología' },
]

export default function HomeScreen({ user, dashboard, onTabChange }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const todayMsg = messages[new Date().getDay() % messages.length]
  const hoy = dashboard?.hoy
  const semana = dashboard?.semana
  const week = buildWeek(semana?.animos || [])

  return (
    <div className="px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-muted-foreground)' }}>{greeting} 👋</p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold">{user.nombre}</h1>
        <p className="text-sm mt-1 capitalize" style={{ color: 'var(--color-muted-foreground)' }}>
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <button onClick={() => onTabChange('emotion')} className="w-full p-5 rounded-[var(--radius-xl)] text-left active:scale-[0.98]" style={{ background: 'var(--color-emerald-deep)' }}>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-3">¿Cómo te sientes hoy?</p>
            <div className="flex gap-3 sm:gap-4">{Object.values(MOODS).map((emoji) => <span key={emoji} className="text-2xl sm:text-3xl">{emoji}</span>)}</div>
            <p className="text-white/50 text-xs mt-3">
              {hoy?.animo ? `Hoy registraste: ${hoy.animo.estado_animo}` : 'Toca para registrar tu estado emocional →'}
            </p>
          </button>

          <div className="rounded-[var(--radius-xl)] p-5" style={{ background: 'var(--color-card)' }}>
            <h3 className="font-semibold text-sm mb-4">Emociones de la semana</h3>
            <div className="flex justify-between">
              {week.map((item) => (
                <div key={item.day} className="flex flex-col items-center gap-1.5">
                  <span className="text-xl sm:text-2xl">{item.emoji}</span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--color-muted-foreground)' }}>{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] p-5" style={{ background: 'linear-gradient(135deg, var(--color-coral) 0%, #d4445e 100%)' }}>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-3">Mensaje del día</p>
            <p className="font-display text-lg font-semibold text-white leading-snug mb-3">“{todayMsg.text}”</p>
            <p className="text-white/60 text-xs">— {todayMsg.author}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Hábitos de hoy</h3>
              <button onClick={() => onTabChange('habits')} className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>Registrar →</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Sueño" value={hoy?.sueno?.horas_totales != null ? `${hoy.sueno.horas_totales} h` : '—'} tone="emerald" />
              <Metric label="Agua" value={hoy ? `${hoy.agua_ml} ml` : '—'} tone="sky" />
              <Metric label="Comidas" value={hoy ? String(hoy.comidas) : '—'} tone="amber" />
              <Metric label="Actividad" value={hoy ? `${hoy.actividad_min} min` : '—'} tone="emerald" />
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] p-5" style={{ background: 'var(--color-card)' }}>
            <h3 className="font-semibold text-sm mb-3">Resumen de 7 días</h3>
            <div className="space-y-2 text-sm">
              <Row label="Promedio de sueño" value={semana?.sueno_promedio != null ? `${semana.sueno_promedio} h` : 'Sin datos'} />
              <Row label="Agua acumulada" value={semana ? `${semana.agua_ml} ml` : '—'} />
              <Row label="Minutos de actividad" value={semana ? `${semana.actividad_min} min` : '—'} />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Acciones rápidas</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '📝', label: 'Registrar hábitos', tab: 'habits' },
                { icon: '💚', label: 'Cómo estoy', tab: 'emotion' },
                { icon: '📚', label: 'Recursos', tab: 'resources' },
              ].map((action) => (
                <button key={action.label} onClick={() => onTabChange(action.tab)} className="p-4 rounded-[var(--radius-lg)] flex flex-col items-center gap-2 active:scale-95" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-[11px] font-semibold text-center leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, tone }) {
  const tones = {
    emerald: ['var(--color-emerald-light)', 'var(--color-primary)'],
    sky: ['var(--color-sky-light)', 'var(--color-sky-calm)'],
    amber: ['var(--color-amber-light)', 'var(--color-amber-warm)'],
  }
  const [background, color] = tones[tone]
  return (
    <div className="p-4 rounded-[var(--radius-lg)]" style={{ background }}>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-muted-foreground)' }}>{label}</p>
      <span className="font-display text-3xl font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ color: 'var(--color-muted-foreground)' }}>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function buildWeek(animos) {
  const labels = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
  const byDate = {}
  for (const item of animos) byDate[String(item.fecha).slice(0, 10)] = item.estado_animo
  const days = []
  const start = new Date()
  const mondayOffset = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - mondayOffset)
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    days.push({ day: labels[date.getDay()], emoji: MOODS[byDate[key]] || '—' })
  }
  return days
}
