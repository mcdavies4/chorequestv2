import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFamily(familyId) {
  const [kids,          setKids]          = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)

  const load = useCallback(async () => {
    if (!familyId) { setLoading(false); return }
    const [k, n] = await Promise.all([
      supabase.from('kids')
        .select('*, chores(*), redeemed_rewards(*), weekly_history(*)')
        .eq('family_id', familyId).order('created_at', { ascending: true }),
      supabase.from('notifications')
        .select('*').eq('family_id', familyId)
        .order('created_at', { ascending: false }).limit(50),
    ])
    setKids(k.data || [])
    setNotifications(n.data || [])
    setLoading(false)
  }, [familyId])

  useEffect(() => { load() }, [load])

  // Realtime
  useEffect(() => {
    if (!familyId) return
    const ch = supabase.channel('rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chores',        filter: `family_id=eq.${familyId}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kids',          filter: `family_id=eq.${familyId}` }, load)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `family_id=eq.${familyId}` },
        (p) => setNotifications(prev => [p.new, ...prev]))
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [familyId, load])

  // Mark chore pending (kid submits)
  const markPending = useCallback(async (choreId, kidId, kidName, choreTitle, famId) => {
    const fid = famId || familyId
    const { error } = await supabase.from('chores').update({ pending: true }).eq('id', choreId)
    if (error) throw error
    await supabase.from('notifications').insert({
      family_id: fid, kid_id: kidId, type: 'pending',
      message: `${kidName} completed '${choreTitle}' — needs approval`,
    })
  }, [familyId])

  // Parent approves
  const approve = useCallback(async (choreId, kidId, coins) => {
    const { error: ce } = await supabase.from('chores').update({ done: true, pending: false }).eq('id', choreId)
    if (ce) throw ce
    const { data: kid, error: ke } = await supabase.from('kids')
      .select('balance, goal_saved').eq('id', kidId).single()
    if (ke) throw ke
    const { error: ue } = await supabase.from('kids').update({
      balance:    +(Number(kid.balance)    + Number(coins)).toFixed(2),
      goal_saved: +(Number(kid.goal_saved) + Number(coins)).toFixed(2),
    }).eq('id', kidId)
    if (ue) throw ue
  }, [])

  // Parent rejects
  const reject = useCallback(async (choreId) => {
    const { error } = await supabase.from('chores').update({ pending: false }).eq('id', choreId)
    if (error) throw error
  }, [])

  const addChore = useCallback(async (kidId, chore) => {
    const { error } = await supabase.from('chores').insert({
      kid_id: kidId, family_id: familyId,
      title: chore.title, icon: chore.icon, coins: chore.coins,
    })
    if (error) throw error
  }, [familyId])

  const updateChore = useCallback(async (choreId, updates) => {
    const { error } = await supabase.from('chores').update(updates).eq('id', choreId)
    if (error) throw error
  }, [])

  const deleteChore = useCallback(async (choreId) => {
    const { error } = await supabase.from('chores').delete().eq('id', choreId)
    if (error) throw error
  }, [])

  const updateGoal = useCallback(async (kidId, name, target) => {
    const { error } = await supabase.from('kids').update({ goal_name: name, goal_target: target }).eq('id', kidId)
    if (error) throw error
  }, [])

  const redeemReward = useCallback(async (kidId, reward) => {
    const { data: kid } = await supabase.from('kids').select('balance, name').eq('id', kidId).single()
    if (!kid || Number(kid.balance) < reward.cost) throw new Error('Not enough coins')
    await Promise.all([
      supabase.from('kids').update({ balance: +(Number(kid.balance) - reward.cost).toFixed(2) }).eq('id', kidId),
      supabase.from('redeemed_rewards').insert({ kid_id: kidId, family_id: familyId, title: reward.title, icon: reward.icon, cost: reward.cost }),
      supabase.from('notifications').insert({ family_id: familyId, kid_id: kidId, type: 'reward', message: `${kid.name} redeemed "${reward.title}"` }),
    ])
  }, [familyId])

  const markRead = useCallback(async (id) => {
    if (id) {
      await supabase.from('notifications').update({ read: true }).eq('id', id)
      setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n))
    } else {
      await supabase.from('notifications').update({ read: true }).eq('family_id', familyId)
      setNotifications(p => p.map(n => ({ ...n, read: true })))
    }
  }, [familyId])

  return { kids, notifications, loading, reload: load, markPending, approve, reject, addChore, updateChore, deleteChore, updateGoal, redeemReward, markRead }
}
