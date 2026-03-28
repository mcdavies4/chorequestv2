import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AdminLogin }     from './AdminLogin'
import { AdminDashboard } from './AdminDashboard'

// Only these emails can access the admin dashboard
const ADMIN_EMAILS = ['azubuikedavies@gmail.com']

export function AdminApp() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [denied,  setDenied]  = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      if (u && ADMIN_EMAILS.includes(u.email)) {
        setUser(u)
      } else if (u) {
        setDenied(true)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null
      if (u && ADMIN_EMAILS.includes(u.email)) {
        setUser(u); setDenied(false)
      } else if (u) {
        setDenied(true); setUser(null)
      } else {
        setUser(null); setDenied(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (!ADMIN_EMAILS.includes(data.user.email)) {
      await supabase.auth.signOut()
      throw new Error('Access denied. Not an admin account.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const styles = {
    minHeight: '100vh',
    background: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Nunito', sans-serif",
  }

  if (loading) return (
    <div style={styles}>
      <div style={{ textAlign: 'center', color: '#475569' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
        <div style={{ fontWeight: 700 }}>Loading admin...</div>
      </div>
    </div>
  )

  if (denied) return (
    <div style={styles}>
      <div style={{ textAlign: 'center', color: '#ef4444', padding: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚫</div>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Access Denied</div>
        <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 20 }}>This account is not authorised to access the admin dashboard.</div>
        <button onClick={handleLogout} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 12, padding: '10px 20px', color: '#94a3b8', fontFamily: "'Nunito',sans-serif", fontWeight: 700, cursor: 'pointer' }}>
          ← Sign out
        </button>
      </div>
    </div>
  )

  if (!user) return <AdminLogin onLogin={handleLogin} />

  return <AdminDashboard user={user} onLogout={handleLogout} />
}
