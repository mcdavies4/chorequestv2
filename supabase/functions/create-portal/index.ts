import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    const SB_URL     = Deno.env.get('SUPABASE_URL')
    const SB_KEY     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!STRIPE_KEY) throw new Error('Missing STRIPE_SECRET_KEY')

    const { family_id, return_url } = await req.json()
    if (!family_id) throw new Error('Missing family_id')

    // Get customer ID
    const subRes = await fetch(
      `${SB_URL}/rest/v1/subscriptions?family_id=eq.${family_id}&select=stripe_customer_id&limit=1`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    )
    const subs = await subRes.json()
    const customerId = subs?.[0]?.stripe_customer_id
    if (!customerId) throw new Error('No Stripe customer found. Please subscribe first.')

    // Create portal session
    const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${STRIPE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        customer:   customerId,
        return_url: return_url || 'https://chorequest-amber.vercel.app/',
      }),
    })

    const portal = await portalRes.json()
    if (!portalRes.ok) throw new Error(portal.error?.message || 'Stripe portal error')

    return new Response(JSON.stringify({ url: portal.url }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[create-portal]', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
