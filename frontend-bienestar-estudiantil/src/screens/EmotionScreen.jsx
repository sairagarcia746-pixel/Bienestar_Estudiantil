import { useEffect, useState } from 'react'
import { api, localDate } from '../api'

const emotions = [
  { emoji: '😢', label: 'Muy mal', estado: 'triste', estres: 5, color: '#c0392b', bg: '#fdeaeb' },
  { emoji: '😔', label: 'Mal', estado: 'ansioso', estres: 4, color: '#e07080', bg: '#fdeef1' },
  { emoji: '😐', label: 'Regular', estado: 'neutral', estres: 3, color: '#d4a017', bg: '#fdf6e3' },
  { emoji: '🙂', label: 'Bien', estado: 'bien', estres: 2, color: '#2d9464', bg: '#e8f5ee' },
  { emoji: '😊', label: 'Muy bien', estado: 'feliz', estres: 1, color: '#1d6b4a', bg: '#d0ede1' },
  { emoji: '🤩', label: 'Excelente', estado: 'motivado', estres: 1, color: '#3a7bbd', bg: '#eaf2fb' },
]

const tags = ['Estrés académico', 'Problemas sociales', 'Salud física', 'Familia', 'Motivación baja', 'Ansiedad', 'Felicidad', 'Logros']
const emojiByEstado = Object.fromEntries(emotions.map((item) => [item.estado, item]))

export default function EmotionScreen({ onChange }) {
  const [selected, setSelected] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [view, setView] = useState('register')
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    const data = await api('/habitos/emocional')
    setHistory(data.registros || [])
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  const save = async () => {
    if (!selected) return
    setError('')
    const emotion = emotions.find((item) => item.estado === selected)
    const notas = [selectedTags.join(', '), note].filter(Boolean).join('. ').slice(0, 255)
    const result = await api('/habitos/emocional', {
      method: 'POST',
      body: JSON.stringify({
        fecha: localDate(),
        estado_animo: emotion.estado,
        nivel_estres: emotion.estres,
        notas,
      }),
    })
    setSaved(Boolean(result))
    setSelected(null)
    setSelectedTags([])
    setNote('')
    await load()
    onChange?.()
    setTimeout(() => setSaved(false), 1800)
  }

  const remove = async (id) => {
    await api(`/habitos/emocional/${id}`, { method: 'DELETE' })
    await load()
    onChange?.()
  }

  return (
    <div className="px-5 py-6 animate-fade-in">
      <h2 className="font-display text-2xl font-bold mb-6">Estado emocional</h2>
      {error && <p className="mb-4 text-sm" style={{ color: 'var(--color-rose-soft)' }}>{error}</p>}
      <div className="flex gap-2 mb-6 p-1 rounded-[var(--radius-full)]" style={{ background: 'var(--color-muted)' }}>
        {[['register', 'Registrar'], ['history', 'Mi historial']].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} className="flex-1 py-2 rounded-[var(--radius-full)] text-sm font-semibold" style={{ background: view === id ? 'var(--color-card)' : 'transparent', color: view === id ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}>
            {label}
          </button>
        ))}
      </div>

      {view === 'register' && (saved ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💚</div>
          <h3 className="font-display text-2xl font-semibold mb-2">¡Registrado!</h3>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Gracias por compartir cómo te sientes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {emotions.map((emotion) => (
              <button key={emotion.estado} onClick={() => setSelected(emotion.estado)} className="p-4 rounded-[var(--radius-xl)] flex flex-col items-center gap-2 border-2" style={{ background: selected === emotion.estado ? emotion.bg : 'var(--color-card)', borderColor: selected === emotion.estado ? emotion.color : 'transparent' }}>
                <span className="text-3xl">{emotion.emoji}</span>
                <span className="text-xs font-semibold" style={{ color: selected === emotion.estado ? emotion.color : 'var(--color-muted-foreground)' }}>{emotion.label}</span>
              </button>
            ))}
          </div>
          {selected && (
            <div className="space-y-5 animate-slide-up">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button key={tag} type="button" onClick={() => setSelectedTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])} className="px-3 py-1.5 rounded-[var(--radius-full)] text-xs font-semibold border" style={{ background: selectedTags.includes(tag) ? 'var(--color-primary)' : 'var(--color-card)', color: selectedTags.includes(tag) ? 'white' : 'var(--color-foreground)', borderColor: selectedTags.includes(tag) ? 'var(--color-primary)' : 'var(--color-border)' }}>
                    {tag}
                  </button>
                ))}
              </div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="¿Qué pasó hoy?" rows={3} maxLength={200} className="field resize-none" />
              <button onClick={save} className="w-full py-4 rounded-[var(--radius-lg)] font-semibold text-white" style={{ background: emojiByEstado[selected].color }}>
                Guardar estado emocional
              </button>
            </div>
          )}
        </div>
      ))}

      {view === 'history' && (
        <div className="space-y-3">
          {history.length === 0 && <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Aún no hay registros emocionales.</p>}
          {history.map((item) => {
            const mood = emojiByEstado[item.estado_animo] || { emoji: '💚', label: item.estado_animo }
            return (
              <div key={item.id_emocional} className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)]" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                <div className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center text-2xl" style={{ background: 'var(--color-muted)' }}>{mood.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">{mood.label}</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--color-muted-foreground)' }}>{String(item.fecha).slice(0, 10)}</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>{item.notas || `Estrés ${item.nivel_estres}/5`}</p>
                </div>
                <button onClick={() => remove(item.id_emocional)} className="text-xs font-semibold" style={{ color: 'var(--color-rose-soft)' }}>Eliminar</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
