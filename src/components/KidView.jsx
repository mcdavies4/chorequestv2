import { useState } from 'react'
import { ProgressBar } from './UI'
import { REWARDS } from '../lib/constants'

export function KidView({ kid, isPremium, onMarkDone, onLogout, onRedeem }) {
  const [tab, setTab] = useState('chores')

  const chores   = kid.chores || []
  const done     = chores.filter(c => c.done).length
  const pending  = chores.filter(c => c.pending).length
  const balance  = Number(kid.balance ?? 0)
  const goalName = kid.goal_name   ?? 'My Goal'
  const goalTgt  = Number(kid.goal_target ?? 10)
  const goalSvd  = Number(kid.goal_saved  ?? 0)
  const redeemed = kid.redeemed_rewards ?? []
  const cats     = [...new Set(REWARDS.map(r => r.category))]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#fef3c7,#fde68a 50%,#fed7aa)', fontFamily: "'Nunito',sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: '#92400e' }}>ChoreQuest 🏆</div>
        <button onClick={onLogout} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '7px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 12, color: '#92400e', cursor: 'pointer' }}>Sign Out</button>
      </div>

      {/* Kid card */}
      <div style={{ margin: '14px 16px 0', background: 'white', borderRadius: 26, padding: '18px 18px 14px', boxShadow: '0 8px 32px #f59e0b33', textAlign: 'center' }}>
        <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 4 }}>{kid.avatar}</div>
        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: '#1e293b' }}>{kid.name}</div>
        <div style={{ fontSize: 34, fontFamily: "'Fredoka One',cursive", color: '#f59e0b', margin: '4px 0 2px' }}>🪙 ${balance.toFixed(2)}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 12 }}>balance · 🔥 {kid.streak ?? 0} day streak</div>
        <div style={{ background: '#fffbeb', borderRadius: 14, padding: '10px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 12, color: '#92400e' }}>🎯 {goalName}</span>
            <span style={{ fontWeight: 800, fontSize: 12, color: '#f59e0b' }}>${goalSvd.toFixed(2)} / ${goalTgt}</span>
          </div>
          <ProgressBar value={goalSvd} max={goalTgt} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '12px 16px 0', background: 'white', borderRadius: 16, padding: 4 }}>
        {[['chores','⚡ Quests'],['store','🛍️ Store'],['history','📋 History']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, background: tab===k?'#f59e0b':'transparent', border: 'none', borderRadius: 12, padding: '9px 4px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: tab===k?'#1e293b':'#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: '14px 16px 80px' }}>
        {/* CHORES */}
        {tab === 'chores' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#92400e' }}>Today's Quests</div>
              <div style={{ background: '#92400e', color: 'white', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{done}/{chores.length}</div>
            </div>
            {chores.length === 0 && <div style={{ textAlign: 'center', padding: 30, color: '#b45309', fontWeight: 700 }}>No chores yet! Ask a parent to add some.</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chores.map(c => (
                <div key={c.id}
                  onClick={e => !c.done && !c.pending && onMarkDone(kid.id, c.id, e)}
                  style={{ background: c.done?'#f0fdf4':c.pending?'#fffbeb':'white', border: c.done?'2px solid #bbf7d0':c.pending?'2px solid #fde68a':'2px solid #f1f5f9', borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: c.done||c.pending?'default':'pointer', opacity: c.done?0.7:1 }}>
                  <div style={{ fontSize: 28 }}>{c.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b', textDecoration: c.done?'line-through':'none' }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>+🪙 ${Number(c.coins).toFixed(2)}</div>
                  </div>
                  <div style={{ fontSize: 20 }}>{c.done?'✅':c.pending?'⏳':'○'}</div>
                </div>
              ))}
            </div>
            {pending > 0 && <div style={{ marginTop: 14, background: '#fef9c3', border: '2px dashed #fbbf24', borderRadius: 14, padding: 14, textAlign: 'center', fontWeight: 800, color: '#92400e', fontSize: 13 }}>⏳ {pending} chore{pending>1?'s':''} waiting for approval!</div>}
          </>
        )}

        {/* STORE — gated */}
        {tab === 'store' && (
          <>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#92400e', marginBottom: 14 }}>Reward Store 🛍️</div>
            {!isPremium ? (
              <div style={{ background: 'white', border: '2px dashed #fde68a', borderRadius: 20, padding: 30, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: '#92400e', marginBottom: 8 }}>Premium Feature</div>
                <div style={{ fontSize: 14, color: '#b45309', fontWeight: 600, marginBottom: 4 }}>The Reward Store is only available on the Premium plan.</div>
                <div style={{ fontSize: 13, color: '#d97706', fontWeight: 600 }}>Ask your parent to upgrade! 🚀</div>
              </div>
            ) : (
              <>
                {cats.map(cat => (
                  <div key={cat} style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{cat}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {REWARDS.filter(r => r.category===cat).map(r => {
                        const can = balance >= r.cost
                        return (
                          <div key={r.id} style={{ background: 'white', border: `2px solid ${can?'#fde68a':'#f1f5f9'}`, borderRadius: 18, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11, opacity: can?1:0.5 }}>
                            <div style={{ fontSize: 28 }}>{r.icon}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>{r.title}</div>
                              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{r.subtitle}</div>
                            </div>
                            <button onClick={() => can && onRedeem(kid.id, r)} disabled={!can} style={{ background: can?'#f59e0b':'#e2e8f0', border: 'none', borderRadius: 11, padding: '7px 11px', fontFamily: "'Fredoka One',cursive", fontSize: 13, color: can?'#1e293b':'#94a3b8', cursor: can?'pointer':'not-allowed', whiteSpace: 'nowrap' }}>
                              🪙 ${r.cost.toFixed(2)}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* HISTORY */}
        {tab === 'history' && (
          <>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#92400e', marginBottom: 14 }}>History 📋</div>
            {redeemed.length === 0
              ? <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontWeight: 700 }}><div style={{ fontSize: 48, marginBottom: 10 }}>🛒</div>No rewards redeemed yet.</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...redeemed].reverse().map((r, i) => (
                    <div key={i} style={{ background: 'white', border: '2px solid #bbf7d0', borderRadius: 16, padding: '12px 15px', display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{ fontSize: 24 }}>{r.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>{r.title}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{r.redeemed_at ? new Date(r.redeemed_at).toLocaleDateString() : ''}</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: '#ef4444' }}>-🪙 ${Number(r.cost).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
            }
          </>
        )}
      </div>
    </div>
  )
}
