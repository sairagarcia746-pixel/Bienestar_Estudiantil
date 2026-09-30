import { useState } from 'react'
import { api } from '../api'

export default function RecoverScreen({ onBack }) {
  const [correo, setCorreo] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const data = await api('/auth/recuperar', {
        method: 'POST',
        body: JSON.stringify({ correo }),
      })
      setMessage(data.message)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-emerald-deep)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          <button onClick={onBack} className="flex items-center gap-2 mb-8 text-white/70">
            <span>←</span><span className="text-sm">Volver</span>
          </button>
          <div className="rounded-[var(--radius-xl)] p-7 card-shadow-lg" style={{ background: 'var(--color-card)' }}>
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="font-display text-2xl font-semibold mb-2">Recuperar contraseña</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-muted-foreground)' }}>
              Escribe tu correo. No revelamos si la cuenta existe.
            </p>
            {message ? (
              <p className="text-sm mb-5" style={{ color: 'var(--color-foreground)' }}>{message}</p>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="usuario@edu.co" className="field" />
                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-[var(--radius-md)] font-semibold text-sm" style={{ background: 'var(--color-primary)', color: 'white' }}>
                  {loading ? 'Enviando...' : 'Solicitar ayuda'}
                </button>
              </form>
            )}
            <button onClick={onBack} className="mt-4 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Volver al inicio</button>
          </div>
        </div>
      </div>
    </div>
  )
}
