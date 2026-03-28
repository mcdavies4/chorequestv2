import { useState } from 'react'

export function AdminLogin({ onLogin }) {
  const [email,   setEmail]   = useState('')
  const [pw,      setPw]      = useState('')
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!email || !pw) { setErr('Enter email and password'); return }
    setLoading(true)
    try {
      await onLogin({ email, password: pw })
    } catch (e) {
      setErr(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: 'white', marginBottom: 4 }}>ChoreQuest Admin</div>
          <div style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Restricted access — admins only</div>
        </div>

        <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 24 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' }}>Admin Email</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="admin@example.com"
              style={{ width: '100%', background: '#0f172a', border: '1.5px solid #334155', borderRadius: 12, padding: '12px 14px', color: 'white', fontSize: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: err ? 10 : 16 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' }}>Password</label>
            <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Password"
              style={{ width: '100%', background: '#0f172a', border: `1.5px solid ${err ? '#ef4444' : '#334155'}`, borderRadius: 12, padding: '12px 14px', color: 'white', fontSize: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {err && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{err}</div>}
          <button onClick={submit} disabled={loading}
            style={{ width: '100%', background: loading ? '#334155' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 12, padding: 13, fontFamily: "'Fredoka One',cursive", fontSize: 18, color: loading ? '#64748b' : 'white', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Access Dashboard →'}
          </button>
        </div>
      </div>
    </div>
  )
}
