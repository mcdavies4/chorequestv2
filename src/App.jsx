import { useState, useEffect } from 'react'
import { useAuth }         from './hooks/useAuth'
import { useFamily }       from './hooks/useFamily'
import { useSubscription } from './hooks/useSubscription'
import { saveOnboarding }  from './lib/onboarding'
import { GLOBAL_STYLES }   from './lib/constants'
import { Toast, CoinBurst, Spinner } from './components/UI'
import { Onboarding }  from './components/Onboarding'
import { Login }       from './components/Login'
import { KidLogin }    from './components/KidLogin'
import { KidView }     from './components/KidView'
import { ParentView }  from './components/ParentView'

export default function App() {
  const { user, family, loading, signUp, signIn, signOut } = useAuth()
  const { kids, notifications, reload, loadWeeklyHistory, markPending, approve, reject,
          addChore, updateChore, deleteChore, updateGoal, redeemReward, markRead } = useFamily(family?.id)
  const { plan, isPremium } = useSubscription(family?.id)

  const [screen,      setScreen]      = useState('loading')
  const [activeKidId, setActiveKidId] = useState(null)
  const [kidUser,     setKidUser]     = useState(null)
  const [toast,       setToast]       = useState(null)
  const [burst,       setBurst]       = useState(null)

  const showToast = msg => setToast(msg)

  // Route as soon as we know enough — don't wait for everything
  useEffect(() => {
    // Still waiting for Supabase to respond
    if (loading) return

    if (user) {
      // User is logged in — go to app immediately
      // ParentView handles the "kids still loading" state gracefully
      setScreen('app')
    } else {
      // No user
      const seen = sessionStorage.getItem('cq_seen')
      setScreen(seen ? 'login' : 'onboarding')
    }
  }, [loading, user])

  useEffect(() => { sessionStorage.setItem('cq_seen', '1') }, [])

  useEffect(() => {
    if (kids.length > 0 && !activeKidId) setActiveKidId(kids[0].id)
  }, [kids])

  const handleSignup = async (data) => {
    if (!data) { setScreen('login'); return }
    try {
      const { family: fam } = await signUp({ email: data.email, password: data.password, parentName: data.parentName })
      await saveOnboarding({ familyId: fam.id, kids: data.kids, selectedChores: data.selectedChores, goals: data.goals })
      await reload()
      setScreen('app')
      showToast(`🎉 Welcome, ${data.parentName}!`)
    } catch (e) { showToast(`❌ ${e.message}`) }
  }

  const handleLogin = async ({ email, password }) => {
    await signIn({ email, password })
    setScreen('app')
  }

  const handleKidLogin = (kid) => {
    setKidUser(kid); setActiveKidId(kid.id); setScreen('kid')
  }

  const handleLogout = async () => {
    await signOut()
    setKidUser(null); setActiveKidId(null)
    sessionStorage.clear()
    setScreen('onboarding')
  }

  const handleMarkDone = async (kidId, choreId, e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setBurst({ x: r.left + r.width/2, y: r.top + r.height/2 })
    try {
      const k = kids.find(k => k.id === kidId) || kidUser
      const c = k?.chores?.find(c => c.id === choreId)
      await markPending(choreId, kidId, k?.name, c?.title, k?.family_id || family?.id)
    } catch (e) { showToast(`❌ ${e.message}`) }
  }

  const handleApprove = async (kidId, choreId) => {
    try {
      const k = kids.find(k => k.id === kidId)
      const c = k?.chores?.find(c => c.id === choreId)
      await approve(choreId, kidId, Number(c?.coins || 0))
      showToast('✅ Approved! Coins added.')
    } catch (e) { showToast(`❌ ${e.message}`) }
  }

  const handleReject = async (kidId, choreId) => {
    try { await reject(choreId); showToast('✗ Sent back.') }
    catch (e) { showToast(`❌ ${e.message}`) }
  }

  const handleSaveChore = async (kidId, chore) => {
    try {
      if (chore.id) await updateChore(chore.id, { title: chore.title, icon: chore.icon, coins: chore.coins, recur_type: chore.recur_type, recur_days: chore.recur_days, recur_day_of_month: chore.recur_day_of_month, photo_required: chore.photo_required })
      else          await addChore(kidId, chore)
    } catch (e) { showToast(`❌ ${e.message}`) }
  }

  const handleDeleteChore = async (kidId, choreId) => {
    try { await deleteChore(choreId); showToast('🗑️ Removed.') }
    catch (e) { showToast(`❌ ${e.message}`) }
  }

  const handleSaveGoal = async (kidId, name, target) => {
    try { await updateGoal(kidId, name, target) }
    catch (e) { showToast(`❌ ${e.message}`) }
  }

  const handleRedeem = async (kidId, reward) => {
    try { await redeemReward(kidId, reward); showToast(`🎉 "${reward.title}" redeemed!`) }
    catch (e) { showToast(`❌ ${e.message}`) }
  }

  const handleAddKid = () => {
    showToast('➕ Go to Settings → Add Kid — feature coming soon!')
  }

  // Only show full spinner on very first load ever (no cache at all)
  if (screen === 'loading') {
    return <><style>{GLOBAL_STYLES}</style><Spinner /></>
  }

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      {burst && <CoinBurst x={burst.x} y={burst.y} onDone={() => setBurst(null)} />}

      <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh' }}>
        {screen === 'onboarding' && <Onboarding onComplete={handleSignup} />}

        {screen === 'login' && (
          <Login
            onParentLogin={handleLogin}
            onKidLogin={() => setScreen('kid-login')}
            onNewFamily={() => setScreen('onboarding')}
          />
        )}

        {screen === 'kid-login' && (
          <KidLogin kids={kids} onLogin={handleKidLogin} onBack={() => setScreen('login')} />
        )}

        {screen === 'kid' && kidUser && (
          <KidView
            kid={kids.find(k => k.id === kidUser.id) || kidUser}
            isPremium={isPremium}
            onMarkDone={handleMarkDone}
            onLogout={handleLogout}
            onRedeem={handleRedeem}
          />
        )}

        {screen === 'app' && (
          <ParentView
            data={{ kids, notifications }}
            plan={plan}
            isPremium={isPremium}
            familyId={family?.id}
            userEmail={user?.email}
            onApprove={handleApprove}
            onReject={handleReject}
            onLogout={handleLogout}
            onMarkRead={markRead}
            onSaveChore={handleSaveChore}
            onDeleteChore={handleDeleteChore}
            onSaveGoal={handleSaveGoal}
            onAddKid={handleAddKid}
            loadWeeklyHistory={loadWeeklyHistory}
            showToast={showToast}
            activeKidId={activeKidId || kids[0]?.id}
            setActiveKidId={setActiveKidId}
          />
        )}
      </div>
    </>
  )
}
