import { useState } from 'react'
import { KID_AVATARS, SUGGESTED_CHORES } from '../lib/constants'
import { inp, lbl } from './UI'

// Free plan: 1 kid max. Kids can only be added during onboarding on free.
// Premium: up to 4 kids.
const FREE_KID_LIMIT = 1

export function Onboarding({ onComplete }) {
  const [step, setStep]     = useState(0)
  const [pName, setPName]   = useState('')
  const [pEmail, setPEmail] = useState('')
  const [pPw, setPPw]       = useState('')
  const [kids, setKids]     = useState([{ id: 1, name: '', age: '', avatar: '🦊', pw: '' }])
  const [kidIdx, setKidIdx] = useState(0)
  const [chores, setChores] = useState({})
  const [goals, setGoals]   = useState({})
  const [errors, setErrors] = useState({})

  const kid = kids[kidIdx]
  const pct = Math.round((step / 5) * 100)

  const setKidField = (field, val) =>
    setKids(p => p.map((k, i) => i === kidIdx ? { ...k, [field]: val } : k))

  const toggleChore = (kidId, c) =>
    setChores(p => {
      const cur = p[kidId] || []
      const ex  = cur.find(x => x.title === c.title)
      return { ...p, [kidId]: ex ? cur.filter(x => x.title !== c.title) : [...cur, { ...c, id: Date.now() + Math.random() }] }
    })

  const validate = () => {
    const e = {}
    if (step === 1) {
      if (!pName.trim()) e.pName = 'Enter your name'
      if (!pEmail.includes('@')) e.pEmail = 'Enter a valid email'
      if (pPw.length < 6) e.pPw = 'At least 6 characters'
    }
    if (step === 2) {
      kids.forEach((k, i) => {
        if (!k.name.trim()) e[`kn${i}`] = 'Enter a name'
        if (!k.age || +k.age < 3 || +k.age > 17) e[`ka${i}`] = 'Age 3–17'
        if (k.pw.length < 3) e[`kp${i}`] = 'Min 3 characters'
      })
    }
    if (step === 3) kids.forEach(k => { if (!(chores[k.id]?.length >= 1)) e[`ch${k.id}`] = 'Pick at least 1' })
    if (step === 4) kids.forEach(k => {
      if (!goals[k.id]?.name?.trim()) e[`gn${k.id}`] = 'Enter goal name'
      if (!goals[k.id]?.target || isNaN(parseFloat(goals[k.id].target))) e[`gt${k.id}`] = 'Enter amount'
    })
    setErrors(e)
    return !Object.keys(e).length
  }

  const next   = () => { if (validate()) setStep(s => s + 1) }
  const back   = () => { setStep(s => s - 1); setErrors({}) }
  const finish = () => onComplete({ parentName: pName, email: pEmail, password: pPw, kids, selectedChores: chores, goals })

  const s = { background: 'linear-gradient(160deg,#0f172a,#1e293b)', minHeight: '100vh', padding: '24px 20px 40px', fontFamily: "'Nunito',sans-serif" }

  return (
    <div style={s}>
      {/* Progress */}
      {step > 0 && step < 5 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>Step {step} of 4</span>
            <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>{pct}%</span>
          </div>
          <div style={{ background: '#1e293b', borderRadius: 99, height: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#f59e0b,#f97316)', borderRadius: 99, width: `${pct}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {/* Step 0 — Welcome */}
      {step === 0 && (
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <div style={{ fontSize: 72, marginBottom: 12, animation: 'bounce 1s ease infinite' }}>🏆</div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 32, color: 'white', marginBottom: 8 }}>Welcome to ChoreQuest!</div>
          <div style={{ color: '#64748b', fontSize: 15, fontWeight: 600, lineHeight: 1.7, marginBottom: 32 }}>
            The fun way to manage chores,<br />reward effort, and teach kids<br />the value of money. 🌟
          </div>
          {[['⚡','Assign chores & track completion'],['🪙','Reward with coins & real pay links'],['🎯','Set savings goals kids care about'],['🏆','Leaderboards, streaks & badges']].map(([ic, txt]) => (
            <div key={txt} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{ic}</span>
              <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: 14 }}>{txt}</span>
            </div>
          ))}
          {/* Free plan info */}
          <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: 14, padding: '12px 16px', marginTop: 4, marginBottom: 20, textAlign: 'left' }}>
            <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: 13, marginBottom: 6 }}>🆓 Free Plan includes:</div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, lineHeight: 1.8 }}>
              ✅ 1 kid · ✅ Chores & approval · ✅ Coin balance · ✅ Savings goal<br />
              🔒 Upgrade for pay links, store, reports & leaderboard
            </div>
          </div>
          <button onClick={() => setStep(1)} style={{ width: '100%', background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 16, padding: 16, fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'white', cursor: 'pointer' }}>
            Set Up My Family 🚀
          </button>
          <button onClick={() => onComplete(null)} style={{ marginTop: 12, background: 'transparent', border: 'none', color: '#475569', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
            I already have an account →
          </button>
        </div>
      )}

      {/* Step 1 — Parent */}
      {step === 1 && (
        <div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: 'white', marginBottom: 4 }}>About You 👋</div>
          <div style={{ color: '#64748b', fontSize: 14, fontWeight: 600, marginBottom: 24 }}>Set up your parent account.</div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Your Name</label>
            <input style={inp(errors.pName)} value={pName} onChange={e => { setPName(e.target.value); setErrors(x => ({...x, pName:null})) }} placeholder="e.g. Sarah" autoComplete="given-name" autoCapitalize="words" />
            {errors.pName && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{errors.pName}</div>}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Email Address</label>
            <input type="email" inputMode="email" style={inp(errors.pEmail)} value={pEmail} onChange={e => { setPEmail(e.target.value); setErrors(x => ({...x, pEmail:null})) }} placeholder="you@example.com" autoComplete="email" autoCapitalize="none" />
            {errors.pEmail && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{errors.pEmail}</div>}
          </div>
          <div>
            <label style={lbl}>Password</label>
            <input type="password" style={inp(errors.pPw)} value={pPw} onChange={e => { setPPw(e.target.value); setErrors(x => ({...x, pPw:null})) }} placeholder="Min. 6 characters" autoComplete="new-password" />
            {errors.pPw && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{errors.pPw}</div>}
          </div>
          <div style={{ background: '#0f172a', border: '1.5px solid #1e3a5f', borderRadius: 12, padding: '10px 14px', marginTop: 16 }}>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>💡 This is for the parent dashboard. Kids get their own PINs.</div>
          </div>
        </div>
      )}

      {/* Step 2 — Kids */}
      {step === 2 && (
        <div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: 'white', marginBottom: 4 }}>Add Your Kid 👧👦</div>
          <div style={{ color: '#64748b', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Free plan includes 1 kid. Upgrade for more.</div>

          {/* Free plan badge */}
          <div style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: 12, padding: '8px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <span style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>Want more kids? Upgrade to Premium after setup.</span>
          </div>

          {kids.length > 1 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {kids.map((k, i) => (
                <button key={k.id} onClick={() => setKidIdx(i)} style={{ flex: 1, background: kidIdx===i?'#f59e0b':'#1e293b', border: kidIdx===i?'none':'1.5px solid #334155', borderRadius: 12, padding: '8px 4px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: kidIdx===i?'#1e293b':'#64748b', cursor: 'pointer' }}>
                  {k.avatar} {k.name || `Kid ${i+1}`}
                </button>
              ))}
            </div>
          )}

          <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 18, marginBottom: 14 }}>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Avatar</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {KID_AVATARS.map(av => (
                  <button key={av} onClick={() => setKidField('avatar', av)} style={{ fontSize: 28, background: kid.avatar===av?'#f59e0b22':'transparent', border: kid.avatar===av?'2px solid #f59e0b':'2px solid transparent', borderRadius: 12, padding: '4px 6px', cursor: 'pointer' }}>{av}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Name</label>
                <input style={{ ...inp(errors[`kn${kidIdx}`]), padding: '11px 12px' }} value={kid.name} onChange={e => { setKidField('name', e.target.value); setErrors(x => ({...x, [`kn${kidIdx}`]:null})) }} placeholder="First name" autoCorrect="off" autoCapitalize="words" />
                {errors[`kn${kidIdx}`] && <div style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, marginTop: 3 }}>{errors[`kn${kidIdx}`]}</div>}
              </div>
              <div>
                <label style={lbl}>Age</label>
                <input type="number" inputMode="numeric" style={{ ...inp(errors[`ka${kidIdx}`]), padding: '11px 12px' }} value={kid.age} onChange={e => { setKidField('age', e.target.value); setErrors(x => ({...x, [`ka${kidIdx}`]:null})) }} placeholder="9" min="3" max="17" />
                {errors[`ka${kidIdx}`] && <div style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, marginTop: 3 }}>{errors[`ka${kidIdx}`]}</div>}
              </div>
            </div>
            <div>
              <label style={lbl}>Kid's PIN</label>
              <input type="password" style={inp(errors[`kp${kidIdx}`])} value={kid.pw} onChange={e => { setKidField('pw', e.target.value); setErrors(x => ({...x, [`kp${kidIdx}`]:null})) }} placeholder="Min. 3 characters" autoComplete="new-password" />
              {errors[`kp${kidIdx}`] && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{errors[`kp${kidIdx}`]}</div>}
            </div>
          </div>

          {/* Only show Add Kid if below free limit — greyed with upgrade note otherwise */}
          {kids.length < FREE_KID_LIMIT ? (
            <button onClick={() => { const id = Date.now(); setKids(p => [...p, { id, name: '', age: '', avatar: '🐼', pw: '' }]); setKidIdx(kids.length) }}
              style={{ width: '100%', background: '#22c55e15', border: '1.5px solid #22c55e', borderRadius: 12, padding: 10, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: '#22c55e', cursor: 'pointer' }}>
              + Add Another Kid
            </button>
          ) : (
            <div style={{ background: '#1e293b', border: '1.5px dashed #334155', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#475569', fontWeight: 700 }}>🔒 Add more kids with Premium ($9.99/mo)</div>
            </div>
          )}

          {kids.length > 1 && (
            <button onClick={() => { setKids(p => p.filter((_,i) => i !== kidIdx)); setKidIdx(Math.max(0, kidIdx-1)) }}
              style={{ width: '100%', marginTop: 8, background: '#ef444415', border: '1.5px solid #ef4444', borderRadius: 12, padding: '10px 16px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: '#ef4444', cursor: 'pointer' }}>
              Remove This Kid
            </button>
          )}
        </div>
      )}

      {/* Step 3 — Chores */}
      {step === 3 && (
        <div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: 'white', marginBottom: 4 }}>Pick Chores ⚡</div>
          <div style={{ color: '#64748b', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Choose from suggestions. Add more later.</div>
          {kids.length > 1 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {kids.map((k, i) => <button key={k.id} onClick={() => setKidIdx(i)} style={{ flex: 1, background: kidIdx===i?'#f59e0b':'#1e293b', border: kidIdx===i?'none':'1.5px solid #334155', borderRadius: 12, padding: '7px 4px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: kidIdx===i?'#1e293b':'#64748b', cursor: 'pointer' }}>{k.avatar} {k.name}</button>)}
            </div>
          )}
          <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: 13, marginBottom: 10 }}>{kid.avatar} {kid.name} — {(chores[kid.id]||[]).length} selected</div>
          {errors[`ch${kid.id}`] && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{errors[`ch${kid.id}`]}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SUGGESTED_CHORES.map(c => {
              const sel = (chores[kid.id]||[]).find(x => x.title === c.title)
              return (
                <div key={c.title} onClick={() => { toggleChore(kid.id, c); setErrors(x => ({...x, [`ch${kid.id}`]:null})) }}
                  style={{ background: sel?'#f59e0b15':'#1e293b', border: sel?'2px solid #f59e0b':'1.5px solid #334155', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <span style={{ fontSize: 24 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: 'white', fontSize: 13 }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>🪙 ${c.coins.toFixed(2)}</div>
                  </div>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: sel?'#f59e0b':'transparent', border: sel?'none':'2px solid #334155', display: 'grid', placeItems: 'center', fontSize: 14, color: '#1e293b', flexShrink: 0 }}>{sel?'✓':''}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 4 — Goals */}
      {step === 4 && (
        <div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: 'white', marginBottom: 4 }}>Savings Goal 🎯</div>
          <div style={{ color: '#64748b', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>What is your kid saving for?</div>
          {kids.map(k => (
            <div key={k.id} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 30 }}>{k.avatar}</span>
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'white' }}>{k.name}'s Goal</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Saving for...</label>
                <input style={inp(errors[`gn${k.id}`])} value={goals[k.id]?.name||''} onChange={e => { setGoals(g => ({...g,[k.id]:{...g[k.id],name:e.target.value}})); setErrors(x => ({...x,[`gn${k.id}`]:null})) }} placeholder="e.g. LEGO Set, Bike..." autoCapitalize="words" />
                {errors[`gn${k.id}`] && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{errors[`gn${k.id}`]}</div>}
              </div>
              <div>
                <label style={lbl}>Target ($)</label>
                <input type="number" inputMode="decimal" style={inp(errors[`gt${k.id}`])} value={goals[k.id]?.target||''} onChange={e => { setGoals(g => ({...g,[k.id]:{...g[k.id],target:e.target.value}})); setErrors(x => ({...x,[`gt${k.id}`]:null})) }} placeholder="e.g. 25" />
                {errors[`gt${k.id}`] && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{errors[`gt${k.id}`]}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 5 — Done */}
      {step === 5 && (
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <div style={{ fontSize: 72, marginBottom: 12 }}>🎉</div>
          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: 'white', marginBottom: 8 }}>You're all set, {pName}!</div>
          <div style={{ color: '#64748b', fontSize: 14, fontWeight: 600, marginBottom: 24 }}>Here's your family:</div>
          {kids.map(k => (
            <div key={k.id} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 18, padding: '14px 16px', marginBottom: 10, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 30 }}>{k.avatar}</span>
                <div>
                  <div style={{ fontWeight: 800, color: 'white', fontSize: 15 }}>{k.name}, age {k.age}</div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>🎯 {goals[k.id]?.name} · ${goals[k.id]?.target}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(chores[k.id]||[]).map(c => <div key={c.title} style={{ background: '#0f172a', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>{c.icon} {c.title}</div>)}
              </div>
            </div>
          ))}
          <button onClick={finish} style={{ width: '100%', marginTop: 8, background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 16, padding: 16, fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'white', cursor: 'pointer' }}>
            Let's Start Questing! 🚀
          </button>
        </div>
      )}

      {/* Nav */}
      {step > 0 && step < 5 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={back} style={{ flex: 1, background: 'transparent', border: '1.5px solid #334155', borderRadius: 14, padding: 13, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15, color: '#64748b', cursor: 'pointer' }}>← Back</button>
          <button onClick={next} style={{ flex: 2, background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 14, padding: 13, fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'white', cursor: 'pointer' }}>{step===4?'Review →':'Continue →'}</button>
        </div>
      )}
    </div>
  )
}
