export default function NotificationsScreen({ items, onClose }) {
  return (
    <div>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h3 className="font-display text-base font-semibold">Recordatorios</h3>
        <button onClick={onClose} className="text-xl w-8 h-8" aria-label="Cerrar">×</button>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {items.length === 0 && <p className="px-5 py-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>No hay avisos por ahora.</p>}
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 px-5 py-4" style={{ background: item.unread ? 'var(--color-background)' : 'transparent', borderBottom: '1px solid var(--color-border)' }}>
            <div className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-xl" style={{ background: 'var(--color-emerald-light)' }}>{item.icon}</div>
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>{item.desc}</p>
              <p className="text-[10px] mt-1 font-mono" style={{ color: 'var(--color-muted-foreground)' }}>{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
