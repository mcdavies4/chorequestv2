import { useState } from 'react'
import { ProgressBar, inp, lbl } from './UI'
import { CHORE_ICONS, REWARDS } from '../lib/constants'
import { startCheckout, openBillingPortal } from '../lib/stripe'

// ── Upgrade Bottom Sheet ──────────────────────────────────────
function UpgradeSheet({ featureName, onClose, onCheckout, busy }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 9000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0f172a', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, padding: '28px 24px 40px', fontFamily: "'Nunito',sans-serif", animation: 'slideUp 0.3s cubic-bezier(.34,1.56,.64,1)' }}>
        <div style={{ width: 40, height: 4, background: '#334155', borderRadius: 99, margin: '0 auto 24px' }} />
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 24, color: 'white', marginBottom: 6 }}>Premium Feature</div>
          <div style={{ background: '#1e293b', border: '1.5px solid #f59e0b44', borderRadius: 12, padding: '8px 16px', display: 'inline-block' }}>
            <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>✨ {featureName} requires Premium</span>
          </div>
        </div>
        <div style={{ background: '#1e293b', border: '2px solid #f59e0b', borderRadius: 20, padding: '18px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div><div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: 'white' }}>Premium</div><div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Billed monthly</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 30, color: '#f59e0b' }}>$9.99</div><div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>per month</div></div>
          </div>
          {[['👨‍👩‍👧','Unlimited kids'],['💸','Pay links (Venmo, Cash App, PayPal)'],['🛍️','Full Reward Store'],['📋','Weekly Reports & charts'],['🏆','Leaderboard']].map(([ic, t]) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{ic}</span>
              <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{t}</span>
            </div>
          ))}
        </div>
        <button onClick={onCheckout} disabled={busy} style={{ width: '100%', background: busy ? '#334155' : 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 16, padding: 15, fontFamily: "'Fredoka One',cursive", fontSize: 20, color: busy ? '#64748b' : 'white', cursor: busy ? 'not-allowed' : 'pointer', marginBottom: 10 }}>
          {busy ? 'Redirecting...' : 'Upgrade to Premium 🚀'}
        </button>
        <button onClick={onClose} style={{ width: '100%', background: 'transparent', border: 'none', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 14, color: '#475569', cursor: 'pointer' }}>Maybe later</button>
      </div>
    </div>
  )
}

// ── Gate wrapper ─────────────────────────────────────────────
// Renders children if premium, otherwise shows lock + upgrade sheet on tap
function Gate({ isPremium, featureName, onCheckout, busy, children }) {
  const [showSheet, setShowSheet] = useState(false)
  if (isPremium) return children
  return (
    <>
      <div onClick={() => setShowSheet(true)} style={{ position: 'relative', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ filter: 'blur(3px)', pointerEvents: 'none' }}>{children}</div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172acc', borderRadius: 16, gap: 8 }}>
          <span style={{ fontSize: 32 }}>🔒</span>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: 'white' }}>Premium Feature</div>
          <div style={{ background: '#f59e0b', borderRadius: 99, padding: '5px 16px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: '#1e293b' }}>Unlock for $9.99/mo</div>
        </div>
      </div>
      {showSheet && <UpgradeSheet featureName={featureName} onClose={() => setShowSheet(false)} onCheckout={onCheckout} busy={busy} />}
    </>
  )
}

// ── Leaderboard ───────────────────────────────────────────────
function Leaderboard({ kids }) {
  const [metric, setMetric] = useState('streak')
  const metrics = [
    { key: 'streak',  label: '🔥 Streak',  get: k => k.streak ?? 0,                                                                   fmt: v => `${v}d`,            color: '#f97316' },
    { key: 'balance', label: '🪙 Balance', get: k => Number(k.balance ?? 0),                                                          fmt: v => `$${v.toFixed(2)}`, color: '#f59e0b' },
    { key: 'done',    label: '✅ Done',    get: k => { const c=k.chores||[]; return c.length?c.filter(x=>x.done).length/c.length:0 }, fmt: v => `${Math.round(v*100)}%`, color: '#22c55e' },
  ]
  const cur    = metrics.find(m => m.key === metric)
  const ranked = [...kids].sort((a,b) => cur.get(b) - cur.get(a))
  const maxVal = Math.max(...kids.map(cur.get), 0.01)
  const MEDALS = ['🥇','🥈','🥉']
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {metrics.map(m => <button key={m.key} onClick={() => setMetric(m.key)} style={{ flex: 1, background: metric===m.key?m.color:'#1e293b', border: metric===m.key?'none':'1.5px solid #334155', borderRadius: 99, padding: '7px 4px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: metric===m.key?'#1e293b':'#64748b', cursor: 'pointer' }}>{m.label}</button>)}
      </div>
      <div style={{ background: '#1e293b', border: `2px solid ${cur.color}44`, borderRadius: 20, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
          {ranked.map((k, i) => {
            const val  = cur.get(k)
            const barH = 40 + Math.round((val/maxVal)*60)
            return (
              <div key={k.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: cur.color }}>{cur.fmt(val)}</div>
                <div style={{ width: i===0?70:56, height: barH, background: i===0?cur.color:`${cur.color}55`, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6 }}>
                  <span style={{ fontSize: i===0?32:24 }}>{k.avatar}</span>
                </div>
                <span style={{ fontSize: 20 }}>{MEDALS[i]||'🏅'}</span>
                <span style={{ fontWeight: 800, fontSize: 12, color: 'white' }}>{k.name}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Weekly Summary ────────────────────────────────────────────
function WeeklySummary({ kid }) {
  const history = kid.weekly_history ?? []
  const [sel, setSel] = useState(0)
  if (!history.length) return <div style={{ color: '#475569', fontWeight: 700, padding: 20, textAlign: 'center' }}>No history yet.</div>
  const w    = history[sel]
  const done = Number(w.chores_completed ?? 0)
  const tot  = Number(w.total_chores ?? 1)
  const pct  = tot > 0 ? Math.round((done/tot)*100) : 0
  return (
    <div>
      <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 18, padding: '14px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 40 }}>{kid.avatar}</div>
        <div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'white' }}>{kid.name}'s Report</div>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>🔥 {kid.streak??0}-day streak</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' }}>
        {history.map((h, i) => <button key={i} onClick={() => setSel(i)} style={{ flexShrink: 0, background: sel===i?'#f59e0b':'#1e293b', border: sel===i?'none':'1.5px solid #334155', borderRadius: 12, padding: '7px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 11, color: sel===i?'#1e293b':'#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>{h.week_label}</button>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[['🪙',`$${Number(w.earned).toFixed(2)}`,'Earned','#f59e0b'],['✅',`${done}/${tot}`,'Completed','#22c55e'],['💸',Number(w.redeemed)>0?`$${Number(w.redeemed).toFixed(2)}`:'—','Redeemed','#f472b6']].map(([ic,v,l,c]) => (
          <div key={l} style={{ background: '#0f172a', border: `1.5px solid ${c}44`, borderRadius: 14, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>{ic}</div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: c }}>{v}</div>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 700 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 800, color: 'white', fontSize: 13 }}>Completion</span>
          <span style={{ fontWeight: 800, color: pct===100?'#22c55e':pct>=75?'#f59e0b':'#ef4444', fontSize: 13 }}>{pct}%</span>
        </div>
        <ProgressBar value={done} max={tot} color={pct===100?'#22c55e':pct>=75?'#f59e0b':'#ef4444'} />
      </div>
    </div>
  )
}

// ── Manage Tab ────────────────────────────────────────────────
function ManageTab({ kid, isPremium, onSave, onDelete, onGoal, onAddKid, showToast, onCheckout, checkoutBusy }) {
  const [form,   setForm]   = useState(null)
  const [picker, setPicker] = useState(false)
  const [gForm,  setGForm]  = useState(null)
  const [sheet,  setSheet]  = useState(false)

  const goalName = kid.goal_name ?? 'My Goal'
  const goalTgt  = Number(kid.goal_target ?? 10)
  const goalSvd  = Number(kid.goal_saved  ?? 0)

  const saveChore = () => {
    if (!form?.title?.trim()) { showToast('⚠️ Enter a title'); return }
    if (!form?.coins || isNaN(parseFloat(form.coins))) { showToast('⚠️ Enter a valid amount'); return }
    onSave(kid.id, { ...form, coins: +parseFloat(form.coins).toFixed(2) })
    setForm(null); setPicker(false)
    showToast(form.id ? '✏️ Updated!' : '✅ Chore added!')
  }

  const saveGoal = () => {
    if (!gForm?.name?.trim()) { showToast('⚠️ Enter a goal name'); return }
    if (!gForm?.target || isNaN(parseFloat(gForm.target))) { showToast('⚠️ Enter a valid amount'); return }
    onGoal(kid.id, gForm.name, parseFloat(gForm.target))
    setGForm(null); showToast('🎯 Goal updated!')
  }

  return (
    <div>
      {/* Goal */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: '#f59e0b' }}>🎯 Savings Goal</div>
          {!gForm && <button onClick={() => setGForm({ name: goalName, target: goalTgt })} style={{ background: '#f59e0b22', border: '1.5px solid #f59e0b', borderRadius: 10, padding: '5px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: '#f59e0b', cursor: 'pointer' }}>✏️ Edit</button>}
        </div>
        {gForm ? (
          <div style={{ background: '#1e293b', border: '2px solid #f59e0b', borderRadius: 18, padding: 16 }}>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Goal Name</label><input style={inp(false)} value={gForm.name} onChange={e => setGForm(g => ({...g, name: e.target.value}))} autoCapitalize="words" /></div>
            <div style={{ marginBottom: 14 }}><label style={lbl}>Target ($)</label><input type="number" inputMode="decimal" style={inp(false)} value={gForm.target} onChange={e => setGForm(g => ({...g, target: e.target.value}))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={() => setGForm(null)} style={{ background: 'transparent', border: '1.5px solid #334155', borderRadius: 12, padding: 10, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveGoal} style={{ background: '#f59e0b', border: 'none', borderRadius: 12, padding: 10, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: '#1e293b', cursor: 'pointer' }}>Save 🎯</button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 14, padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 800, color: 'white', fontSize: 13 }}>{goalName}</span>
              <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: 13 }}>${goalSvd.toFixed(2)} / ${goalTgt}</span>
            </div>
            <ProgressBar value={goalSvd} max={goalTgt} />
          </div>
        )}
      </div>

      {/* Add another kid — premium gate */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: '#f59e0b', marginBottom: 10 }}>👨‍👩‍👧 Kids</div>
        {isPremium ? (
          <button onClick={onAddKid} style={{ width: '100%', background: '#22c55e15', border: '1.5px solid #22c55e', borderRadius: 12, padding: 11, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: '#22c55e', cursor: 'pointer' }}>+ Add Another Kid</button>
        ) : (
          <div onClick={() => setSheet(true)} style={{ cursor: 'pointer', background: '#1e293b', border: '1.5px dashed #334155', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🔒</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: 'white', fontSize: 14 }}>Add more kids</div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Premium — $9.99/mo</div>
            </div>
            <div style={{ background: '#f59e0b', borderRadius: 99, padding: '4px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 11, color: '#1e293b' }}>Upgrade</div>
          </div>
        )}
        {sheet && <UpgradeSheet featureName="Multiple Kids" onClose={() => setSheet(false)} onCheckout={onCheckout} busy={checkoutBusy} />}
      </div>

      {/* Chores */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: '#f59e0b' }}>⚡ Chores</div>
        <button onClick={() => { setForm({ title: '', coins: '', icon: '🧹' }); setPicker(false) }} style={{ background: '#22c55e22', border: '1.5px solid #22c55e', borderRadius: 10, padding: '5px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: '#22c55e', cursor: 'pointer' }}>+ Add</button>
      </div>

      {form && (
        <div style={{ background: '#1e293b', border: '2px solid #818cf8', borderRadius: 18, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#818cf8', marginBottom: 12 }}>{form.id ? '✏️ Edit Chore' : '➕ New Chore'}</div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Icon</label>
            <button onClick={() => setPicker(p => !p)} style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: 12, padding: '10px 14px', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {form.icon}<span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>tap to change</span>
            </button>
            {picker && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, background: '#0f172a', borderRadius: 12, padding: 10 }}>
                {CHORE_ICONS.map(ic => <button key={ic} onClick={() => { setForm(f => ({...f, icon: ic})); setPicker(false) }} style={{ fontSize: 22, background: form.icon===ic?'#334155':'transparent', border: 'none', borderRadius: 8, padding: '4px 6px', cursor: 'pointer' }}>{ic}</button>)}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 12 }}><label style={lbl}>Title</label><input style={inp(false)} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Clean bathroom" /></div>
          <div style={{ marginBottom: 14 }}><label style={lbl}>Coins ($)</label><input type="number" inputMode="decimal" min="0.25" step="0.25" style={inp(false)} value={form.coins} onChange={e => setForm(f => ({...f, coins: e.target.value}))} placeholder="e.g. 0.75" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => { setForm(null); setPicker(false) }} style={{ background: 'transparent', border: '1.5px solid #334155', borderRadius: 12, padding: 10, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
            <button onClick={saveChore} style={{ background: '#818cf8', border: 'none', borderRadius: 12, padding: 10, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'white', cursor: 'pointer' }}>Save ✓</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(kid.chores||[]).map(c => (
          <div key={c.id} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 14, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{c.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 13 }}>{c.title}</div>
              <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>🪙 ${Number(c.coins).toFixed(2)}</div>
            </div>
            <button onClick={() => { setForm({...c}); setPicker(false) }} style={{ background: '#334155', border: 'none', borderRadius: 8, padding: '5px 8px', fontSize: 13, cursor: 'pointer' }}>✏️</button>
            <button onClick={() => onDelete(kid.id, c.id)} style={{ background: '#ef444415', border: '1.5px solid #ef4444', borderRadius: 8, padding: '5px 8px', fontSize: 13, cursor: 'pointer' }}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main ParentView ───────────────────────────────────────────
export function ParentView({ data, plan, isPremium, familyId, userEmail, onApprove, onReject, onLogout, onMarkRead, onSaveChore, onDeleteChore, onSaveGoal, onAddKid, showToast, activeKidId, setActiveKidId }) {
  const [tab,          setTab]          = useState('home')
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [cashTag,      setCashTag]      = useState(() => localStorage.getItem('cq_cash') || '')
  const [paypalName,   setPaypalName]   = useState(() => localStorage.getItem('cq_pp')   || '')
  const [venmoName,    setVenmoName]    = useState(() => localStorage.getItem('cq_vm')   || '')
  const [editPay,      setEditPay]      = useState(false)

  const savePayLinks = () => {
    localStorage.setItem('cq_cash', cashTag)
    localStorage.setItem('cq_pp',   paypalName)
    localStorage.setItem('cq_vm',   venmoName)
    setEditPay(false); showToast('💸 Pay links saved!')
  }

  const kid = data.kids.find(k => k.id === activeKidId) || data.kids[0]

  if (!kid) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0f172a,#1e293b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48, animation: 'pulse 1.5s ease infinite' }}>🏆</div>
      <div style={{ color: '#475569', fontWeight: 700, fontSize: 14, fontFamily: "'Nunito',sans-serif" }}>Loading dashboard...</div>
    </div>
  )

  const pending      = (kid.chores||[]).filter(c => c.pending)
  const unread       = (data.notifications||[]).filter(n => !n.read).length
  const totalPending = data.kids.reduce((s,k) => s + (k.chores||[]).filter(c=>c.pending).length, 0)
  const goalName     = kid.goal_name   ?? 'My Goal'
  const goalTarget   = Number(kid.goal_target ?? 10)
  const goalSaved    = Number(kid.goal_saved  ?? 0)

  const checkout = async () => {
    if (!familyId || !userEmail) { showToast('❌ Missing account info'); return }
    setCheckoutBusy(true)
    try { await startCheckout({ familyId, email: userEmail }) }
    catch (e) { showToast(`❌ ${e.message}`); setCheckoutBusy(false) }
  }

  const portal = async () => {
    try { await openBillingPortal({ familyId }) }
    catch (e) { showToast(`❌ ${e.message}`) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0f172a,#1e293b)', fontFamily: "'Nunito',sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 24, color: 'white' }}>ChoreQuest 🏆</div>
          <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{isPremium ? '⭐ Premium' : '🔒 Free Plan'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!isPremium && <button onClick={() => setTab('upgrade')} style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 12, padding: '7px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: 'white', cursor: 'pointer' }}>⭐ Upgrade</button>}
          <button onClick={onLogout} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 12, padding: '7px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>

      {/* Kid tabs */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 16px 0' }}>
        {data.kids.map(k => {
          const kp = (k.chores||[]).filter(c=>c.pending).length
          return (
            <button key={k.id} onClick={() => setActiveKidId(k.id)} style={{ flex: 1, background: activeKidId===k.id?'#f59e0b':'#1e293b', border: activeKidId===k.id?'none':'2px solid #334155', borderRadius: 16, padding: '11px 6px', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", color: activeKidId===k.id?'#1e293b':'white', transition: 'all 0.2s', position: 'relative' }}>
              <div style={{ fontSize: 26 }}>{k.avatar}</div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>{k.name}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>🔥 {k.streak??0}d</div>
              {kp > 0 && <div style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', borderRadius: 99, width: 20, height: 20, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800 }}>{kp}</div>}
            </button>
          )
        })}
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', margin: '12px 16px 0', background: '#0f172a', borderRadius: 16, padding: 4, gap: 2 }}>
        {[
          ['home',        '📊'],
          ['approve',     totalPending > 0 ? `✅${totalPending}` : '✅'],
          ['manage',      '✏️'],
          ['summary',     '📋'],
          ['leaderboard', '🏆'],
          ['notifs',      unread > 0 ? `🔔${unread}` : '🔔'],
          isPremium ? ['billing','⭐'] : ['upgrade','🔒'],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, background: tab===key?'#f59e0b':'transparent', border: 'none', borderRadius: 11, padding: '9px 2px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: tab===key?'#1e293b':'#475569', cursor: 'pointer', transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '14px 16px 80px' }}>

        {/* HOME */}
        {tab === 'home' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { label:'Balance',    value:`$${Number(kid.balance??0).toFixed(2)}`, icon:'🪙', color:'#f59e0b' },
                { label:'Streak',     value:`${kid.streak??0} days`,                 icon:'🔥', color:'#f97316' },
                { label:'Done Today', value:`${(kid.chores||[]).filter(c=>c.done).length}/${(kid.chores||[]).length}`, icon:'✅', color:'#22c55e' },
                { label:'Goal',       value:`${goalTarget>0?Math.round((goalSaved/goalTarget)*100):0}%`, icon:'🎯', color:'#818cf8' },
              ].map(s => (
                <div key={s.label} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 16, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 16, padding: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 800, color: 'white', fontSize: 13 }}>🎯 {goalName}</span>
                <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: 13 }}>${goalSaved.toFixed(2)} / ${goalTarget}</span>
              </div>
              <ProgressBar value={goalSaved} max={goalTarget} color="#818cf8" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {(kid.chores||[]).map(c => (
                <div key={c.id} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 13, padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 10, opacity: c.done?0.5:1 }}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: 'white', fontSize: 13, textDecoration: c.done?'line-through':'none' }}>{c.title}</div><div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>+🪙 ${Number(c.coins).toFixed(2)}</div></div>
                  <span style={{ fontSize: 15 }}>{c.done?'✅':c.pending?'⏳':'○'}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* APPROVE */}
        {tab === 'approve' && (
          <>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#f59e0b', marginBottom: 10 }}>Pending Approvals ⏳</div>
            {pending.length === 0
              ? <div style={{ textAlign: 'center', padding: 40, color: '#475569', fontWeight: 700 }}><div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>All caught up!</div>
              : pending.map(chore => {
                  const amt     = Number(chore.coins).toFixed(2)
                  const noteEnc = encodeURIComponent(`${kid.name} chores - ${chore.title}`)
                  const venmoUrl  = venmoName  ? `venmo://paycharge?txn=pay&amount=${amt}&note=${noteEnc}&recipients=${venmoName}` : 'https://venmo.com/'
                  const cashUrl   = cashTag    ? `https://cash.app/$${cashTag.replace('$','')}/${amt}` : 'https://cash.app/'
                  const paypalUrl = paypalName ? `https://paypal.me/${paypalName}/${amt}` : 'https://paypal.com/'

                  return (
                    <div key={chore.id} style={{ background: '#1e293b', border: '2px solid #fbbf24', borderRadius: 22, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div style={{ fontSize: 30 }}>{chore.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, color: 'white', fontSize: 15 }}>{chore.title}</div>
                          <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>+🪙 ${amt} for {kid.name}</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                        <button onClick={async () => { try { await onReject(kid.id, chore.id) } catch(e) { showToast(`❌ ${e.message}`) } }} style={{ background: '#ef444415', border: '2px solid #ef4444', borderRadius: 12, padding: 10, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: '#ef4444', cursor: 'pointer' }}>✗ Reject</button>
                        <button onClick={async () => { try { await onApprove(kid.id, chore.id) } catch(e) { showToast(`❌ ${e.message}`) } }} style={{ background: '#22c55e', border: 'none', borderRadius: 12, padding: 10, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'white', cursor: 'pointer' }}>✓ Approve!</button>
                      </div>

                      {/* Pay links — gated */}
                      <div style={{ borderTop: '1.5px solid #334155', marginBottom: 10, paddingTop: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>💸 Send ${amt}</div>
                        <Gate isPremium={isPremium} featureName="Pay Links" onCheckout={checkout} busy={checkoutBusy}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
                            {[['💙','Venmo','#008cff',venmoUrl],['💚','Cash App','#00d64f',cashUrl],['💛','PayPal','#009cde',paypalUrl]].map(([em,lb,cl,url]) => (
                              <a key={lb} href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                <div style={{ background: `${cl}15`, border: `1.5px solid ${cl}`, borderRadius: 12, padding: '9px 4px', textAlign: 'center', cursor: 'pointer' }}>
                                  <div style={{ fontSize: 18, marginBottom: 2 }}>{em}</div>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: cl }}>{lb}</div>
                                  <div style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>${amt}</div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </Gate>
                        {isPremium && (!cashTag || !paypalName) && <div onClick={() => setTab('manage')} style={{ marginTop: 8, background: '#1e3a5f', border: '1.5px solid #3b82f6', borderRadius: 10, padding: '7px 12px', fontSize: 12, color: '#93c5fd', fontWeight: 600, textAlign: 'center', cursor: 'pointer' }}>⚙️ Set up pay usernames in Manage tab →</div>}
                      </div>
                    </div>
                  )
                })
            }
          </>
        )}

        {/* MANAGE */}
        {tab === 'manage' && (
          <div>
            {/* Pay links settings — gated */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: '#f59e0b' }}>💸 Pay Links</div>
                {isPremium && !editPay && <button onClick={() => setEditPay(true)} style={{ background: '#f59e0b22', border: '1.5px solid #f59e0b', borderRadius: 10, padding: '5px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: '#f59e0b', cursor: 'pointer' }}>✏️ Edit</button>}
              </div>
              {!isPremium ? (
                <Gate isPremium={false} featureName="Pay Links" onCheckout={checkout} busy={checkoutBusy}>
                  <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 14, padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Set up Venmo, Cash App and PayPal links to send real money after approving chores.</div>
                  </div>
                </Gate>
              ) : editPay ? (
                <div style={{ background: '#1e293b', border: '2px solid #f59e0b', borderRadius: 18, padding: 16 }}>
                  {[['💙 Venmo Username','e.g. john-smith',venmoName,setVenmoName],['💚 Cash App $tag','e.g. johnsmith',cashTag,setCashTag],['💛 PayPal.me Username','e.g. johnsmith',paypalName,setPaypalName]].map(([l,p,v,s]) => (
                    <div key={l} style={{ marginBottom: 12 }}>
                      <label style={lbl}>{l}</label>
                      <input style={inp(false)} value={v} onChange={e => s(e.target.value)} placeholder={p} autoCapitalize="none" autoCorrect="off" />
                    </div>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button onClick={() => setEditPay(false)} style={{ background: 'transparent', border: '1.5px solid #334155', borderRadius: 12, padding: 10, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={savePayLinks} style={{ background: '#f59e0b', border: 'none', borderRadius: 12, padding: 10, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: '#1e293b', cursor: 'pointer' }}>Save 💸</button>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 14, padding: '12px 16px' }}>
                  {venmoName||cashTag||paypalName
                    ? <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {venmoName  && <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>💙 Venmo: <span style={{ color: 'white' }}>{venmoName}</span></div>}
                        {cashTag    && <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>💚 Cash App: <span style={{ color: 'white' }}>${cashTag.replace('$','')}</span></div>}
                        {paypalName && <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>💛 PayPal: <span style={{ color: 'white' }}>paypal.me/{paypalName}</span></div>}
                      </div>
                    : <div style={{ fontSize: 13, color: '#475569', fontWeight: 600, textAlign: 'center' }}>No pay links set. Tap Edit to add your usernames.</div>
                  }
                </div>
              )}
            </div>
            <ManageTab kid={kid} isPremium={isPremium} onSave={onSaveChore} onDelete={onDeleteChore} onGoal={onSaveGoal} onAddKid={onAddKid} showToast={showToast} onCheckout={checkout} checkoutBusy={checkoutBusy} />
          </div>
        )}

        {/* SUMMARY — gated */}
        {tab === 'summary' && (
          <>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#f59e0b', marginBottom: 14 }}>Weekly Report 📋</div>
            <Gate isPremium={isPremium} featureName="Weekly Reports" onCheckout={checkout} busy={checkoutBusy}>
              <WeeklySummary kid={kid} />
            </Gate>
          </>
        )}

        {/* LEADERBOARD — gated */}
        {tab === 'leaderboard' && (
          <>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#f59e0b', marginBottom: 14 }}>Leaderboard 🏆</div>
            <Gate isPremium={isPremium} featureName="Leaderboard" onCheckout={checkout} busy={checkoutBusy}>
              <Leaderboard kids={data.kids} />
            </Gate>
          </>
        )}

        {/* UPGRADE PAGE */}
        {tab === 'upgrade' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: 'white', marginBottom: 4 }}>Unlock Premium</div>
              <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Everything your family needs</div>
            </div>
            <div style={{ background: '#1e293b', border: '2px solid #f59e0b', borderRadius: 22, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div><div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'white' }}>Premium</div><div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Billed monthly</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 34, color: '#f59e0b' }}>$9.99</div><div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>per month</div></div>
              </div>
              {[['👨‍👩‍👧','Unlimited kids','Free plan: 1 kid only'],['💸','Pay links','Venmo, Cash App & PayPal'],['🛍️','Full Reward Store','Kids redeem coins for treats'],['📋','Weekly Reports','Earnings charts & history'],['🏆','Leaderboard','Fun competition between kids']].map(([ic,t,d]) => (
                <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{ic}</span>
                  <div><div style={{ fontWeight: 800, color: 'white', fontSize: 14 }}>{t}</div><div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{d}</div></div>
                </div>
              ))}
            </div>
            <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 16, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, color: '#64748b', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Your free plan includes</div>
              {['✅ 1 kid','✅ Chores & approval flow','✅ Coin balance tracker','✅ Savings goal','❌ Multiple kids','❌ Pay links, Reward Store, Reports, Leaderboard'].map(f => (
                <div key={f} style={{ fontSize: 13, color: f.startsWith('✅')?'#94a3b8':'#475569', fontWeight: 600, marginBottom: 4 }}>{f}</div>
              ))}
            </div>
            <button onClick={checkout} disabled={checkoutBusy} style={{ width: '100%', background: checkoutBusy?'#334155':'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 16, padding: 16, fontFamily: "'Fredoka One',cursive", fontSize: 20, color: checkoutBusy?'#64748b':'white', cursor: checkoutBusy?'not-allowed':'pointer', marginBottom: 8 }}>
              {checkoutBusy ? 'Redirecting...' : 'Upgrade to Premium 🚀'}
            </button>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#334155', fontWeight: 600 }}>Secured by Stripe · Cancel anytime</div>
          </div>
        )}

        {/* BILLING */}
        {tab === 'billing' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>⭐</div>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: 'white', marginBottom: 4 }}>You're on Premium!</div>
              <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>All features unlocked</div>
            </div>
            <div style={{ background: '#1e293b', border: '2px solid #22c55e', borderRadius: 20, padding: 18, marginBottom: 16 }}>
              {[['👨‍👩‍👧','Unlimited kids'],['💸','Pay links'],['🛍️','Reward Store'],['📋','Weekly Reports'],['🏆','Leaderboard']].map(([ic,l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{ic}</span>
                  <span style={{ fontWeight: 700, color: 'white', fontSize: 14, flex: 1 }}>{l}</span>
                  <span style={{ color: '#22c55e', fontSize: 16 }}>✓</span>
                </div>
              ))}
            </div>
            <button onClick={portal} style={{ width: '100%', background: '#1e293b', border: '1.5px solid #334155', borderRadius: 16, padding: 15, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15, color: '#94a3b8', cursor: 'pointer' }}>Manage Subscription →</button>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {tab === 'notifs' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#f59e0b' }}>Notifications 🔔</div>
              {unread > 0 && <button onClick={() => onMarkRead()} style={{ background: 'transparent', border: '1.5px solid #334155', borderRadius: 10, padding: '5px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 12, color: '#64748b', cursor: 'pointer' }}>Mark all read</button>}
            </div>
            {(data.notifications||[]).length === 0
              ? <div style={{ textAlign: 'center', padding: 40, color: '#475569', fontWeight: 700 }}>No notifications yet.</div>
              : (data.notifications||[]).map(n => (
                  <div key={n.id} onClick={() => onMarkRead(n.id)} style={{ background: n.read?'#1e293b':'#1e3a5f', border: n.read?'1.5px solid #334155':'1.5px solid #3b82f6', borderRadius: 16, padding: '14px 16px', cursor: 'pointer', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 18 }}>{n.type==='pending'?'⏳':n.type==='reward'?'🎁':'🔥'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'white', fontSize: 13, lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginTop: 3 }}>{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
                      </div>
                      {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: 4 }} />}
                    </div>
                  </div>
                ))
            }
          </>
        )}
      </div>
    </div>
  )
}
