import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Cache family in sessionStorage — instant on refresh
const CACHE_KEY = 'cq_fam'
const getCache  = () => { try { return JSON.parse(sessionStorage.getItem(CACHE_KEY)) } catch { return null } }
const setCache  = (d) => { try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(d)) } catch {} }
const clearCache= () => { try { sessionStorage.removeItem(CACHE_KEY) } catch {} }

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [family,  setFamily]  = useState(getCache)   // instant from cache
  const [loading, setLoading] = useState(true)

  const fetchFamily = useCallback(async (uid) => {
    try {
      const { data } = await supabase
        .from('families').select('*').eq('parent_id', uid).single()
      setFamily(data ?? null)
      if (data) setCache(data)
      else clearCache()
    } catch (e) {
      console.error('fetchFamily:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        // If we have cache, stop showing spinner immediately
        if (getCache()) setLoading(false)
        fetchFamily(u.id)
      } else {
        clearCache()
        setFamily(null)
        setLoading(false)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchFamily(u.id)
      else { setFamily(null); clearCache(); setLoading(false) }
    })
    return () => { mounted = false; subscription.unsubscribe() }
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
    setCache(fam)
    return { user: data.user, family: fam }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null); setFamily(null); clearCache()
  }, [])

  return { user, family, loading, signUp, signIn, signOut }
}
