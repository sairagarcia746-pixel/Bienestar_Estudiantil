import { useState } from 'react'
import BrandLogo from '../components/BrandLogo'

export default function LoginScreen({ onLogin, onRegister, onRecover }) {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!correo || !contrasena) {
      setError('Completa todos los campos')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onLogin(correo, contrasena)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: 'var(--color-emerald-deep)' }}>
      <div className="hidden lg:flex flex-col justify-between w-5/12 xl:w-1/2 px-12 py-16 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="absolute -bottom-16 -right-8 w-64 h-64 rounded-full opacity-10" style={{ background: 'white' }} />
        <BrandLogo variant="full" light />
        <div className="relative z-10">
          <p className="font-display text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Tu bienestar<br />
            <span className="italic font-normal">es nuestra prioridad.</span>
          </p>
          <p className="text-white/65 text-base leading-relaxed max-w-sm">
            Registra sueño, alimentación, agua, actividad y cómo te sientes. Solo tú ves tus hábitos.
          </p>
          <div className="flex flex-wrap gap-3 mt-10">
            {[
              { icon: '😴', label: 'Sueño' },
              { icon: '💧', label: 'Hidratación' },
              { icon: '💚', label: 'Ánimo' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <span>{item.icon}</span>
                <span className="text-white/80 text-xs font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-xs relative z-10">Cuidar • Registrar • Avanzar</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="lg:hidden mb-10 text-center">
          <BrandLogo variant="compact" light />
        </div>
        <div className="w-full max-w-sm animate-slide-up">
          <div className="rounded-[var(--radius-xl)] p-7 sm:p-8 card-shadow-lg" style={{ background: 'var(--color-card)' }}>
            <h2 className="font-display text-2xl font-semibold mb-1">Iniciar sesión</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-muted-foreground)' }}>
              Ingresa con el correo de tu cuenta
            </p>
            {error && (
              <div className="mb-4 px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium" style={{ background: 'var(--color-rose-light)', color: 'var(--color-rose-soft)' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>Correo</label>
                <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="usuario@edu.co" className="field" autoComplete="email" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>Contraseña</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="••••••••" className="field pr-12" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-lg" aria-label="Mostrar contraseña">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button type="button" onClick={onRecover} className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                ¿Olvidaste tu contraseña?
              </button>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-[var(--radius-md)] font-semibold text-sm active:scale-95" style={{ background: 'var(--color-primary)', color: 'white', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Entrando...' : 'Ingresar'}
              </button>
            </form>
            <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                ¿No tienes cuenta?{' '}
                <button onClick={onRegister} className="font-semibold" style={{ color: 'var(--color-primary)' }}>Regístrate aquí</button>
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-white/60 text-xs">Tus registros de salud solo los puedes ver tú.</p>
        </div>
      </div>
    </div>
  )
}
