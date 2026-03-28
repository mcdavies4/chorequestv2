import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSubscription(familyId) {
  const [plan,   setPlan]   = useState('free')
  const [status, setStatus] = useState('active')

  const load = useCallback(async () => {
    if (!familyId) return
    try {
      const { data } = await supabase.from('subscriptions')
        .select('plan, status').eq('family_id', familyId).single()
      if (data) { setPlan(data.plan); setStatus(data.status) }
    } catch { /* default to free */ }
  }, [familyId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!familyId) return
    const ch = supabase.channel('sub_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions', filter: `family_id=eq.${familyId}` },
        (p) => { setPlan(p.new.plan); setStatus(p.new.status) })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [familyId])

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('checkout') === 'success') {
      setTimeout(load, 2000)
      window.history.replaceState({}, '', '/')
    } else if (p.get('checkout') === 'cancel') {
      window.history.replaceState({}, '', '/')
    }
  }, [])

  return { plan, status, isPremium: plan === 'premium' && status === 'active', reload: load }
}
