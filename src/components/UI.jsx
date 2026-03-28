import { useEffect } from 'react'

export function ProgressBar({ value, max, color = '#f59e0b' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ background: '#1e293b', borderRadius: 99, height: 10, overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}bb)`, transition: 'width 0.6s cubic-bezier(.34,1.56,.64,1)', boxShadow: `0 0 8px ${color}66` }} />
    </div>
  )
}

export function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [])
  return (
    <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: 'white', padding: '12px 20px', borderRadius: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 14, zIndex: 9999, boxShadow: '0 8px 32px #00000066', whiteSpace: 'nowrap', maxWidth: '90vw', textAlign: 'center' }}>
      {msg}
    </div>
  )
}

export function CoinBurst({ x, y, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 900); return () => clearTimeout(t) }, [])
  return (
    <div style={{ position: 'fixed', left: x - 20, top: y - 20, pointerEvents: 'none', zIndex: 9998 }}>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * 360, d = 40 + Math.random() * 30
        return <div key={i} style={{ position: 'absolute', fontSize: 16, animation: 'coinFly 0.85s ease-out forwards', '--dx': `${Math.cos(a*Math.PI/180)*d}px`, '--dy': `${Math.sin(a*Math.PI/180)*d}px` }}>🪙</div>
      })}
    </div>
  )
}

export function Spinner() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 52, animation: 'pulse 1.5s ease infinite' }}>🏆</div>
      <div style={{ fontFamily: "'Nunito',sans-serif", color: '#475569', fontWeight: 700, fontSize: 14 }}>Loading ChoreQuest...</div>
    </div>
  )
}

// Shared input style
export const inp = (err) => ({
  width: '100%', background: '#0f172a',
  border: `1.5px solid ${err ? '#ef4444' : '#334155'}`,
  borderRadius: 14, padding: '13px 16px', color: 'white',
  fontSize: 16, fontFamily: "'Nunito',sans-serif", fontWeight: 700,
  outline: 'none', boxSizing: 'border-box', WebkitAppearance: 'none',
})

export const lbl = {
  fontSize: 11, fontWeight: 800, color: '#475569',
  textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block',
}
