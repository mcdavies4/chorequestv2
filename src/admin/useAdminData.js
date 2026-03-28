import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminData() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Run all queries in parallel
      const [
        familiesRes,
        kidsRes,
        choresRes,
        subsRes,
        notifRes,
      ] = await Promise.all([
        supabase.from('families').select('id, parent_name, created_at'),
        supabase.from('kids').select('id, family_id, name, age, balance, streak, created_at'),
        supabase.from('chores').select('id, family_id, done, pending, coins, created_at'),
        supabase.from('subscriptions').select('id, family_id, plan, status, stripe_customer_id, created_at, updated_at'),
        supabase.from('notifications').select('id, family_id, type, read, created_at').order('created_at', { ascending: false }).limit(100),
      ])

      const families = familiesRes.data || []
      const kids     = kidsRes.data     || []
      const chores   = choresRes.data   || []
      const subs     = subsRes.data     || []
      const notifs   = notifRes.data    || []

      // ── Signup growth (by week) ──────────────────────────
      const now   = new Date()
      const weeks = Array.from({ length: 8 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (7 * (7 - i)))
        return d
      })

      const signupsByWeek = weeks.map((weekStart, i) => {
        const weekEnd = weeks[i + 1] || new Date()
        const count   = families.filter(f => {
          const d = new Date(f.created_at)
          return d >= weekStart && d < weekEnd
        }).length
        return {
          label: `${weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`,
          count,
          total: families.filter(f => new Date(f.created_at) < weekEnd).length,
        }
      }).slice(1)

      // ── Free vs Premium ──────────────────────────────────
      const premiumFamilies = subs.filter(s => s.plan === 'premium' && s.status === 'active').length
      const freeFamilies    = families.length - premiumFamilies
      const canceledSubs    = subs.filter(s => s.status === 'canceled').length
      const pastDueSubs     = subs.filter(s => s.status === 'past_due').length

      // ── Revenue / MRR ────────────────────────────────────
      const mrr      = premiumFamilies * 9.99
      const totalRev = mrr // Simplified — real revenue would come from Stripe

      // ── Active users ─────────────────────────────────────
      // We approximate by families created in last 30/7 days
      // In production you'd track last_seen via Supabase Auth
      const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const sevenDaysAgo  = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      // Use chore activity as proxy for active users
      const activeFamily7  = new Set(chores.filter(c => new Date(c.created_at) >= sevenDaysAgo).map(c => c.family_id))
      const activeFamily30 = new Set(chores.filter(c => new Date(c.created_at) >= thirtyDaysAgo).map(c => c.family_id))

      // ── Chore stats ──────────────────────────────────────
      const totalChores     = chores.length
      const completedChores = chores.filter(c => c.done).length
      const pendingChores   = chores.filter(c => c.pending).length
      const completionRate  = totalChores > 0 ? Math.round((completedChores / totalChores) * 100) : 0
      const totalCoinsEarned = chores.filter(c => c.done).reduce((s, c) => s + Number(c.coins), 0)

      // Chores completed by day (last 14 days)
      const choresByDay = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (13 - i))
        const dayStart = new Date(d.setHours(0,0,0,0))
        const dayEnd   = new Date(d.setHours(23,59,59,999))
        return {
          label: dayStart.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          count: chores.filter(c => c.done && new Date(c.created_at) >= dayStart && new Date(c.created_at) <= dayEnd).length,
        }
      })

      // ── Per-family details ───────────────────────────────
      const familyDetails = families.map(f => {
        const fKids  = kids.filter(k => k.family_id === f.id)
        const fChores = chores.filter(c => c.family_id === f.id)
        const fSub   = subs.find(s => s.family_id === f.id)
        return {
          ...f,
          kidCount:       fKids.length,
          choreCount:     fChores.length,
          doneCount:      fChores.filter(c => c.done).length,
          plan:           fSub?.plan   || 'free',
          status:         fSub?.status || 'active',
          hasStripe:      !!fSub?.stripe_customer_id,
          totalEarned:    fChores.filter(c => c.done).reduce((s, c) => s + Number(c.coins), 0),
        }
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setData({
        // Summary stats
        totalFamilies:   families.length,
        premiumFamilies,
        freeFamilies,
        canceledSubs,
        pastDueSubs,
        totalKids:       kids.length,
        mrr,
        totalRev,
        // Active users
        active7:  activeFamily7.size,
        active30: activeFamily30.size,
        // Chore stats
        totalChores,
        completedChores,
        pendingChores,
        completionRate,
        totalCoinsEarned,
        // Chart data
        signupsByWeek,
        choresByDay,
        // Details
        familyDetails,
        recentNotifs: notifs.slice(0, 20),
      })
    } catch (e) {
      console.error('Admin data error:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { data, loading, error, reload: load }
}
