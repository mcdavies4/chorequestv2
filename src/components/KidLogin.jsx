import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function KidLogin({ kids: kidsProp, onLogin, onBack }) {
  const [kids,    setKids]    = useState(kidsProp || [])
  const [sel,     setSel]     = useState(null)
  const [pin,     setPin]     = useState('')
  const [err,     setErr]     = useState('')
  const [shake,   setShake]   = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (kidsProp && kidsProp.length > 0) { setKids(kidsProp); return }
    setLoading(true)
    supabase.from('kids')
      .select('*, chores(*), redeemed_rewards(*), weekly_history(*)')
      .order('created_at', { ascending: true })
      .then(({ data }) => { setKids(data || []); setLoading(false) })
  }, [])

  const login = () => {
    if (!sel) return
    if (pin === sel.pin) onLogin({ ...sel })
    else { setErr('Wrong PIN! Try again.'); setShake(true); setTimeout(() => setShake(false), 500) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#fef3c7,#fde68a 50%,#fed7aa)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ fontSize: 52, marginBottom: 6 }}>🏆</div>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: '#92400e', marginBottom: 4 }}>Who are you?</div>
      <div style={{ color: '#b45309', fontSize: 14, fontWeight: 600, marginBottom: 24 }}>Pick your avatar</div>

      <div style={{ width: '100%', maxWidth: 380 }}>
        {loading
          ? <div style={{ textAlign: 'center', color: '#b45309', fontWeight: 700, padding: 20 }}>Loading...</div>
          : kids.length === 0
            ? <div style={{ textAlign: 'center', color: '#b45309', fontWeight: 700, padding: 20 }}>No kids found. Ask a parent to set up first.</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {kids.map(k => (
                  <button key={k.id} onClick={() => { setSel(k); setPin(''); setErr('') }} style={{ display: 'flex', alignItems: 'center', gap: 14, background: sel?.id===k.id?'#f59e0b':'white', border: sel?.id===k.id?'none':'2px solid #fde68a', borderRadius: 18, padding: '13px 18px', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", color: '#1e293b', textAlign: 'left' }}>
                    <span style={{ fontSize: 34 }}>{k.avatar}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{k.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.6 }}>Age {k.age}</div>
                    </div>
                    {sel?.id===k.id && <span style={{ fontSize: 20 }}>✓</span>}
                  </button>
                ))}
              </div>
        }

        {sel && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ color: '#92400e', fontSize: 12, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Enter your PIN</div>
            <div style={{ animation: shake ? 'shake 0.4s ease' : 'none' }}>
              <input type="password" value={pin} onChange={e => { setPin(e.target.value); setErr('') }} onKeyDown={e => e.key==='Enter' && login()} placeholder="Your secret PIN"
                style={{ width: '100%', background: 'white', border: err?'2px solid #ef4444':'2px solid #fde68a', borderRadius: 14, padding: '13px 16px', color: '#1e293b', fontSize: 16, fontFamily: "'Nunito',sans-serif", fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {err && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 5 }}>{err}</div>}
            <button onClick={login} style={{ width: '100%', marginTop: 12, background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 14, padding: 14, fontFamily: "'Fredoka One',cursive", fontSize: 20, color: 'white', cursor: 'pointer' }}>Let's Go! 🚀</button>
          </div>
        )}

        <button onClick={onBack} style={{ width: '100%', marginTop: 14, background: 'transparent', border: 'none', color: '#b45309', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>← Parent login</button>
      </div>
    </div>
  )
}
