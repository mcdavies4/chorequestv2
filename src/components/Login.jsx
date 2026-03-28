import { useState } from 'react'
import { inp } from './UI'

export function Login({ onParentLogin, onKidLogin, onNewFamily }) {
  const [email,   setEmail]   = useState('')
  const [pw,      setPw]      = useState('')
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)
  const [shake,   setShake]   = useState(false)

  const submit = async () => {
    if (!email || !pw) { setErr('Enter your email and password'); return }
    setLoading(true)
    try {
      await onParentLogin({ email, password: pw })
    } catch (e) {
      setErr(e.message || 'Login failed')
      setShake(true); setTimeout(() => setShake(false), 500)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0f172a,#1e293b)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ fontSize: 56, marginBottom: 6 }}>🏆</div>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 36, color: 'white', marginBottom: 4 }}>ChoreQuest</div>
      <div style={{ color: '#475569', fontSize: 14, fontWeight: 600, marginBottom: 36 }}>Earn. Save. Level Up.</div>

      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'white', marginBottom: 16 }}>👨‍👩‍👧 Parent Login</div>
          <div style={{ marginBottom: 12 }}>
            <input type="email" inputMode="email" value={email} onChange={e => { setEmail(e.target.value); setErr('') }} placeholder="Email address" autoCapitalize="none" autoComplete="email"
              style={{ ...inp(false), marginBottom: 0 }} />
          </div>
          <div style={{ animation: shake ? 'shake 0.4s ease' : 'none', marginBottom: err ? 8 : 12 }}>
            <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr('') }} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Password" autoComplete="current-password"
              style={inp(!!err)} />
          </div>
          {err && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{err}</div>}
          <button onClick={submit} disabled={loading} style={{ width: '100%', background: loading ? '#334155' : 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 12, padding: 13, fontFamily: "'Fredoka One',cursive", fontSize: 18, color: loading ? '#64748b' : 'white', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : "Let's Go! 🚀"}
          </button>
        </div>

        <button onClick={onKidLogin} style={{ width: '100%', background: 'linear-gradient(160deg,#fef3c7,#fde68a)', border: 'none', borderRadius: 18, padding: '16px 18px', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <span style={{ fontSize: 30 }}>👧</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#92400e' }}>I'm a Kid</div>
            <div style={{ fontSize: 12, color: '#b45309' }}>Log in with your PIN</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 18 }}>→</span>
        </button>

        <button onClick={onNewFamily} style={{ width: '100%', background: 'transparent', border: '1.5px solid #334155', borderRadius: 14, padding: 13, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, color: '#64748b', cursor: 'pointer' }}>
          🏠 New Family? Set up here →
        </button>
      </div>
    </div>
  )
}
