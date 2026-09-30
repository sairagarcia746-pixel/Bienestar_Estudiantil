import { useState } from 'react'

export default function RegisterScreen({ onBack, onSubmit }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nombre: '', apellido: '', correo: '', fecha_nacimiento: '', contrasena: '', confirmar: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (step === 1) {
      if (!form.nombre || !form.apellido || !form.correo) {
        setError('Completa nombre, apellido y correo')
        return
      }
      setStep(2)
      return
    }
    if (form.contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (form.contrasena !== form.confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-emerald-deep)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={step === 2 ? () => setStep(1) : onBack} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }} aria-label="Volver">
              <span className="text-white text-lg">←</span>
            </button>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Crear cuenta</h1>
              <p className="text-white/60 text-xs">Paso {step} de 2</p>
            </div>
          </div>
          <div className="flex gap-2 mb-6">
            {[1, 2].map((item) => (
              <div key={item} className="h-1.5 flex-1 rounded-full" style={{ background: item <= step ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)' }} />
            ))}
          </div>
          <div className="rounded-[var(--radius-xl)] p-7 card-shadow-lg" style={{ background: 'var(--color-card)' }}>
            {error && (
              <div className="mb-4 px-4 py-3 rounded-[var(--radius-md)] text-sm" style={{ background: 'var(--color-rose-light)', color: 'var(--color-rose-soft)' }}>{error}</div>
            )}
            <form onSubmit={submit} className="space-y-4">
              {step === 1 ? (
                <>
                  <h2 className="font-display text-xl font-semibold">Información personal</h2>
                  <Field label="Nombre" value={form.nombre} onChange={(value) => update('nombre', value)} placeholder="Tu nombre" />
                  <Field label="Apellido" value={form.apellido} onChange={(value) => update('apellido', value)} placeholder="Tu apellido" />
                  <Field label="Correo" type="email" value={form.correo} onChange={(value) => update('correo', value)} placeholder="usuario@edu.co" />
                  <Field label="Fecha de nacimiento" type="date" value={form.fecha_nacimiento} onChange={(value) => update('fecha_nacimiento', value)} />
                </>
              ) : (
                <>
                  <h2 className="font-display text-xl font-semibold">Contraseña segura</h2>
                  <Field label="Contraseña" type="password" value={form.contrasena} onChange={(value) => update('contrasena', value)} placeholder="Mínimo 8 caracteres" />
                  <Field label="Confirmar contraseña" type="password" value={form.confirmar} onChange={(value) => update('confirmar', value)} placeholder="Repite tu contraseña" />
                  <div className="text-xs p-3 rounded-[var(--radius-md)]" style={{ background: 'var(--color-emerald-light)', color: 'var(--color-primary)' }}>
                    Mínimo 8 caracteres. La contraseña se guarda cifrada.
                  </div>
                </>
              )}
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-[var(--radius-md)] font-semibold text-sm" style={{ background: 'var(--color-primary)', color: 'white' }}>
                {loading ? 'Creando cuenta...' : step === 1 ? 'Continuar →' : 'Crear cuenta'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="field" />
    </div>
  )
}
