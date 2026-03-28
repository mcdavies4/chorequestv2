import { useState } from 'react'
import { useAdminData } from './useAdminData'

// ── Mini bar chart ────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, color = '#6366f1', height = 80 }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: height + 24 }}>
      {data.map((d, i) => {
        const barH = Math.max(Math.round((d[valueKey] / max) * height), 2)
        const isLast = i === data.length - 1
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 10, color: isLast ? color : '#334155', fontWeight: 700 }}>{d[valueKey] > 0 ? d[valueKey] : ''}</div>
            <div title={`${d[labelKey]}: ${d[valueKey]}`} style={{ width: '100%', height: barH, background: isLast ? color : `${color}66`, borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease', minHeight: 2 }} />
            {data.length <= 8 && <div style={{ fontSize: 9, color: '#334155', fontWeight: 700, whiteSpace: 'nowrap', transform: 'rotate(-35deg)', transformOrigin: 'top center', marginTop: 4 }}>{d[labelKey]}</div>}
          </div>
        )
      })}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = '#6366f1', onClick }) {
  return (
    <div onClick={onClick} style={{ background: '#1e293b', border: `1.5px solid ${color}33`, borderRadius: 16, padding: '16px 14px', cursor: onClick ? 'pointer' : 'default', transition: 'border-color 0.2s' }}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = color)}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = `${color}33`)}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontWeight: 800, color: 'white', fontSize: 13, marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{sub}</div>}
    </div>
  )
}

// ── User row ──────────────────────────────────────────────────
function UserRow({ family, idx }) {
  const [open, setOpen] = useState(false)
  const planColor = family.plan === 'premium' ? '#f59e0b' : '#475569'
  const statusColor = family.status === 'active' ? '#22c55e' : family.status === 'past_due' ? '#ef4444' : '#64748b'

  return (
    <>
      <tr onClick={() => setOpen(o => !o)} style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#0f172a' : '#1e293b' }}
        onMouseEnter={e => e.currentTarget.style.background = '#1e3a5f'}
        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#0f172a' : '#1e293b'}>
        <td style={{ padding: '12px 14px', fontSize: 13, color: 'white', fontWeight: 700 }}>{family.parent_name}</td>
        <td style={{ padding: '12px 14px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>{new Date(family.created_at).toLocaleDateString()}</td>
        <td style={{ padding: '12px 14px' }}><span style={{ background: `${planColor}22`, border: `1.5px solid ${planColor}`, borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 800, color: planColor }}>{family.plan}</span></td>
        <td style={{ padding: '12px 14px' }}><span style={{ color: statusColor, fontWeight: 800, fontSize: 12 }}>{family.status}</span></td>
        <td style={{ padding: '12px 14px', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{family.kidCount}</td>
        <td style={{ padding: '12px 14px', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{family.doneCount}/{family.choreCount}</td>
        <td style={{ padding: '12px 14px', fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>${family.totalEarned.toFixed(2)}</td>
        <td style={{ padding: '12px 14px', fontSize: 14, color: '#334155' }}>{open ? '▲' : '▼'}</td>
      </tr>
      {open && (
        <tr style={{ background: '#0a1628' }}>
          <td colSpan={8} style={{ padding: '12px 20px' }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                <span style={{ color: '#475569' }}>Family ID: </span>
                <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{family.id}</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                <span style={{ color: '#475569' }}>Stripe: </span>
                <span style={{ color: family.hasStripe ? '#22c55e' : '#ef4444' }}>{family.hasStripe ? '✓ Connected' : '✗ Not connected'}</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                <span style={{ color: '#475569' }}>Coins earned: </span>
                <span style={{ color: '#f59e0b' }}>🪙 ${family.totalEarned.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                <span style={{ color: '#475569' }}>Completion: </span>
                <span style={{ color: 'white' }}>{family.choreCount > 0 ? Math.round((family.doneCount / family.choreCount) * 100) : 0}%</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
export function AdminDashboard({ user, onLogout }) {
  const { data, loading, error, reload } = useAdminData()
  const [tab,    setTab]    = useState('overview')
  const [search, setSearch] = useState('')

  const s = {
    minHeight: '100vh',
    background: '#0f172a',
    fontFamily: "'Nunito', sans-serif",
    color: 'white',
  }

  const filtered = data?.familyDetails?.filter(f =>
    f.parent_name?.toLowerCase().includes(search.toLowerCase())
  ) || []

  if (loading) return (
    <div style={{ ...s, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🏆</div>
      <div style={{ color: '#475569', fontWeight: 700 }}>Loading admin data...</div>
    </div>
  )

  if (error) return (
    <div style={{ ...s, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <div style={{ color: '#ef4444', fontWeight: 700 }}>Error: {error}</div>
      <button onClick={reload} style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 12, padding: '10px 20px', color: '#94a3b8', fontFamily: "'Nunito',sans-serif", fontWeight: 700, cursor: 'pointer' }}>Retry</button>
    </div>
  )

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ background: '#1e293b', borderBottom: '1.5px solid #334155', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🏆</span>
          <div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: 'white' }}>ChoreQuest Admin</div>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{user.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={reload} style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: 10, padding: '7px 14px', color: '#64748b', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>↻ Refresh</button>
          <button onClick={onLogout} style={{ background: '#0f172a', border: '1.5px solid #334155', borderRadius: 10, padding: '7px 14px', color: '#64748b', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, padding: '0 24px', background: '#1e293b', borderBottom: '1.5px solid #334155' }}>
        {[['overview','📊 Overview'],['users','👥 Users'],['chores','⚡ Chores'],['revenue','💰 Revenue']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ background: 'transparent', border: 'none', borderBottom: tab===key?'2px solid #6366f1':'2px solid transparent', padding: '14px 16px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, color: tab===key?'#6366f1':'#475569', cursor: 'pointer', transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '24px' }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'white', marginBottom: 20 }}>Overview</div>

            {/* Key metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
              <StatCard icon="👨‍👩‍👧" label="Total Families"    value={data.totalFamilies}   color="#6366f1" sub="All time signups" />
              <StatCard icon="⭐" label="Premium"           value={data.premiumFamilies} color="#f59e0b" sub={`${data.freeFamilies} on free`} />
              <StatCard icon="👧" label="Total Kids"         value={data.totalKids}       color="#22c55e" sub="Across all families" />
              <StatCard icon="💰" label="MRR"                value={`$${data.mrr.toFixed(0)}`} color="#f59e0b" sub="Monthly recurring" />
              <StatCard icon="📅" label="Active (7d)"        value={data.active7}         color="#38bdf8" sub="Families with chore activity" />
              <StatCard icon="📅" label="Active (30d)"       value={data.active30}        color="#818cf8" sub="Families with chore activity" />
            </div>

            {/* Signup growth chart */}
            <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 20, marginBottom: 20 }}>
              <div style={{ fontWeight: 800, color: 'white', fontSize: 15, marginBottom: 4 }}>📈 Signup Growth</div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 16 }}>New families per week — last 7 weeks</div>
              <BarChart data={data.signupsByWeek} valueKey="count" labelKey="label" color="#6366f1" height={100} />
            </div>

            {/* Plan split */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 20 }}>
                <div style={{ fontWeight: 800, color: 'white', fontSize: 15, marginBottom: 16 }}>🥧 Plan Split</div>
                {data.totalFamilies > 0 ? (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>⭐ Premium</span>
                        <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 800 }}>{Math.round((data.premiumFamilies / data.totalFamilies) * 100)}%</span>
                      </div>
                      <div style={{ background: '#0f172a', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, background: '#f59e0b', width: `${Math.round((data.premiumFamilies / data.totalFamilies) * 100)}%`, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>🆓 Free</span>
                        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 800 }}>{Math.round((data.freeFamilies / data.totalFamilies) * 100)}%</span>
                      </div>
                      <div style={{ background: '#0f172a', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, background: '#334155', width: `${Math.round((data.freeFamilies / data.totalFamilies) * 100)}%`, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  </>
                ) : <div style={{ color: '#475569', fontSize: 13, fontWeight: 600 }}>No data yet</div>}
              </div>

              <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 20 }}>
                <div style={{ fontWeight: 800, color: 'white', fontSize: 15, marginBottom: 16 }}>💰 Revenue</div>
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 36, color: '#f59e0b', marginBottom: 4 }}>${data.mrr.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 12 }}>Monthly Recurring Revenue</div>
                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{data.premiumFamilies} × $9.99/mo</div>
                {data.canceledSubs > 0 && <div style={{ marginTop: 8, fontSize: 12, color: '#ef4444', fontWeight: 600 }}>⚠️ {data.canceledSubs} canceled</div>}
                {data.pastDueSubs > 0  && <div style={{ marginTop: 4,  fontSize: 12, color: '#f97316', fontWeight: 600 }}>⚠️ {data.pastDueSubs} past due</div>}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'white' }}>All Users ({data.totalFamilies})</div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name..."
                style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 12, padding: '9px 14px', color: 'white', fontSize: 13, fontFamily: "'Nunito',sans-serif", fontWeight: 700, outline: 'none', width: 220 }}
              />
            </div>

            <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0f172a' }}>
                    {['Parent Name','Joined','Plan','Status','Kids','Chores','Earned',''].map(h => (
                      <th key={h} style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#475569', fontWeight: 700 }}>No users found</td></tr>
                    : filtered.map((f, i) => <UserRow key={f.id} family={f} idx={i} />)
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CHORES */}
        {tab === 'chores' && (
          <div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'white', marginBottom: 20 }}>Chore Stats</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
              <StatCard icon="⚡" label="Total Chores"   value={data.totalChores}    color="#6366f1" />
              <StatCard icon="✅" label="Completed"      value={data.completedChores} color="#22c55e" sub={`${data.completionRate}% completion rate`} />
              <StatCard icon="⏳" label="Pending"        value={data.pendingChores}   color="#f59e0b" sub="Awaiting approval" />
              <StatCard icon="🪙" label="Coins Earned"   value={`$${data.totalCoinsEarned.toFixed(0)}`} color="#f59e0b" sub="Total across all kids" />
            </div>

            <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 20 }}>
              <div style={{ fontWeight: 800, color: 'white', fontSize: 15, marginBottom: 4 }}>⚡ Chores Completed</div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 16 }}>Per day — last 14 days</div>
              <BarChart data={data.choresByDay} valueKey="count" labelKey="label" color="#22c55e" height={120} />
            </div>

            <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 20, marginTop: 16 }}>
              <div style={{ fontWeight: 800, color: 'white', fontSize: 15, marginBottom: 14 }}>📊 Completion Rate by Family</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.familyDetails.filter(f => f.choreCount > 0).slice(0, 10).map(f => {
                  const rate = Math.round((f.doneCount / f.choreCount) * 100)
                  return (
                    <div key={f.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>{f.parent_name}</span>
                        <span style={{ fontSize: 13, color: rate >= 75 ? '#22c55e' : rate >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 800 }}>{rate}%</span>
                      </div>
                      <div style={{ background: '#0f172a', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, background: rate >= 75 ? '#22c55e' : rate >= 50 ? '#f59e0b' : '#ef4444', width: `${rate}%`, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* REVENUE */}
        {tab === 'revenue' && (
          <div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'white', marginBottom: 20 }}>Revenue</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
              <StatCard icon="💰" label="MRR"          value={`$${data.mrr.toFixed(2)}`}          color="#f59e0b" sub="Monthly Recurring Revenue" />
              <StatCard icon="📈" label="ARR"          value={`$${(data.mrr * 12).toFixed(0)}`}   color="#22c55e" sub="Annual Run Rate" />
              <StatCard icon="⭐" label="Premium Users" value={data.premiumFamilies}               color="#f59e0b" sub={`$9.99/mo each`} />
              <StatCard icon="🆓" label="Free Users"   value={data.freeFamilies}                  color="#6366f1" sub="Conversion opportunity" />
            </div>

            {data.canceledSubs > 0 || data.pastDueSubs > 0 ? (
              <div style={{ background: '#1e293b', border: '1.5px solid #ef444444', borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <div style={{ fontWeight: 800, color: '#ef4444', fontSize: 14, marginBottom: 10 }}>⚠️ Attention Required</div>
                {data.canceledSubs > 0 && <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>• {data.canceledSubs} canceled subscription{data.canceledSubs > 1 ? 's' : ''}</div>}
                {data.pastDueSubs > 0  && <div style={{ fontSize: 13, color: '#f97316', fontWeight: 600 }}>• {data.pastDueSubs} past due — payment failed</div>}
              </div>
            ) : null}

            <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 20, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, color: 'white', fontSize: 15, marginBottom: 14 }}>💳 Premium Subscribers</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.familyDetails.filter(f => f.plan === 'premium').length === 0
                  ? <div style={{ color: '#475569', fontSize: 13, fontWeight: 600, textAlign: 'center', padding: 20 }}>No premium subscribers yet</div>
                  : data.familyDetails.filter(f => f.plan === 'premium').map(f => (
                      <div key={f.id} style={{ background: '#0f172a', border: '1.5px solid #f59e0b33', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20 }}>⭐</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, color: 'white', fontSize: 13 }}>{f.parent_name}</div>
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Since {new Date(f.created_at).toLocaleDateString()} · {f.kidCount} kid{f.kidCount !== 1 ? 's' : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: 13 }}>$9.99/mo</div>
                          <div style={{ fontSize: 11, color: f.status === 'active' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{f.status}</div>
                        </div>
                      </div>
                    ))
                }
              </div>
            </div>

            <div style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: 20 }}>
              <div style={{ fontWeight: 800, color: 'white', fontSize: 15, marginBottom: 6 }}>🎯 Conversion Opportunity</div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 14 }}>Free users who could convert to Premium</div>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: '#6366f1', marginBottom: 4 }}>${(data.freeFamilies * 9.99).toFixed(0)}/mo</div>
              <div style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>potential MRR if all {data.freeFamilies} free users convert</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
