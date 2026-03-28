import { supabase } from './supabase'

export async function startCheckout({ familyId, email }) {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: {
      family_id:   familyId,
      email,
      success_url: `${window.location.origin}/?checkout=success`,
      cancel_url:  `${window.location.origin}/?checkout=cancel`,
    },
  })
  if (error) throw new Error(error.message)
  if (!data?.url) throw new Error('No checkout URL returned')
  window.location.href = data.url
}

export async function openBillingPortal({ familyId }) {
  const { data, error } = await supabase.functions.invoke('create-portal', {
    body: { family_id: familyId, return_url: `${window.location.origin}/` },
  })
  if (error) throw new Error(error.message)
  if (!data?.url) throw new Error('No portal URL returned')
  window.location.href = data.url
}
