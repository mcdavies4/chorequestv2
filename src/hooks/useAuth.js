import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [family,  setFamily]  = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchFamily = useCallback(async (uid) => {
    const { data } = await supabase
      .from('families').select('*').eq('parent_id', uid).single()
    setFamily(data ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchFamily(u.id)
      else   setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchFamily(u.id)
      else { setFamily(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [fetchFamily])

  const signUp = useCallback(async ({ email, password, parentName }) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    const { data: fam, error: ferr } = await supabase
      .from('families').insert({ parent_id: data.user.id, parent_name: parentName })
      .select().single()
    if (ferr) throw ferr
    await supabase.from('subscriptions').insert({ family_id: fam.id, plan: 'free', status: 'active' })
    setFamily(fam)
    return { user: data.user, family: fam }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null); setFamily(null)
  }, [])

  return { user, family, loading, signUp, signIn, signOut }
}
