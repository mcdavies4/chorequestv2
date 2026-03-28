import { supabase } from './supabase'

export async function saveOnboarding({ familyId, kids, selectedChores, goals }) {
  for (const kid of kids) {
    const { data: k, error: ke } = await supabase.from('kids').insert({
      family_id:   familyId,
      name:        kid.name,
      age:         parseInt(kid.age),
      avatar:      kid.avatar,
      pin:         kid.pw,
      goal_name:   goals[kid.id]?.name   || 'My Goal',
      goal_target: parseFloat(goals[kid.id]?.target || 10),
      goal_saved:  0,
      balance:     0,
      streak:      0,
    }).select().single()
    if (ke) throw ke

    const chores = selectedChores[kid.id] || []
    if (chores.length) {
      await supabase.from('chores').insert(
        chores.map(c => ({ kid_id: k.id, family_id: familyId, title: c.title, icon: c.icon, coins: c.coins }))
      )
    }

    await supabase.from('weekly_history').insert(
      ['This Week','Last Week','2 Weeks Ago','3 Weeks Ago'].map(w => ({
        kid_id: k.id, family_id: familyId, week_label: w,
        earned: 0, chores_completed: 0, total_chores: chores.length, redeemed: 0, top_chore: '—',
      }))
    )

    await supabase.from('notifications').insert({
      family_id: familyId, kid_id: k.id, type: 'streak',
      message: `👋 ${k.name} joined ChoreQuest! Chores are ready.`,
    })
  }
}
