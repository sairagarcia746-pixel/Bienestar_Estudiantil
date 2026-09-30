export default function BrandLogo({ variant = 'full', light = false }) {
  const fg = light ? '#ffffff' : '#1a2e1e'
  const sub = light ? 'rgba(255,255,255,0.65)' : '#6b7569'

  const Icon = () => (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="22" cy="22" r="20" stroke={fg} strokeWidth="2.2" fill="none" />
      <path d="M22 30 C22 30 12 23 12 17 C12 13.5 14.7 11 18 11 C20 11 21.5 12 22 13 C22.5 12 24 11 26 11 C29.3 11 32 13.5 32 17 C32 23 22 30 22 30Z" fill={fg} />
      <path d="M10 34 Q22 40 34 34" stroke={fg} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )

  if (variant === 'icon') return <Icon />

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2.5">
        <Icon />
        <div>
          <div className="font-display font-bold text-lg leading-none" style={{ color: fg }}>BienEstar</div>
          <div className="text-[10px] font-semibold tracking-wide mt-0.5" style={{ color: sub }}>Mental y Estudiantil</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Icon />
      <div>
        <div className="font-display font-bold leading-tight" style={{ color: fg, fontSize: '1.35rem' }}>
          BIENESTAR<br />MENTAL Y ESTUDIANTIL
        </div>
        <div className="text-xs font-medium tracking-widest mt-1" style={{ color: sub }}>
          PWA • Bienestar • Hábitos
        </div>
      </div>
    </div>
  )
}
