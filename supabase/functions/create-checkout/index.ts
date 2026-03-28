import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const STRIPE_KEY   = Deno.env.get('STRIPE_SECRET_KEY')
    const PRICE_ID     = Deno.env.get('STRIPE_PRICE_ID')
    const SB_URL       = Deno.env.get('SUPABASE_URL')
    const SB_KEY       = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!STRIPE_KEY) throw new Error('Missing STRIPE_SECRET_KEY')
    if (!PRICE_ID)   throw new Error('Missing STRIPE_PRICE_ID')

    const { family_id, email, success_url, cancel_url } = await req.json()
    if (!family_id) throw new Error('Missing family_id')
    if (!email)     throw new Error('Missing email')

    const OK = 'https://chorequest-amber.vercel.app'

    // Look up existing customer
    const subRes = await fetch(
      `${SB_URL}/rest/v1/subscriptions?family_id=eq.${family_id}&select=stripe_customer_id&limit=1`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    )
    const subs = await subRes.json()
    let customerId = subs?.[0]?.stripe_customer_id ?? null

    // Create customer if needed
    if (!customerId) {
      const res = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: { Authorization: `Bearer ${STRIPE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, 'metadata[family_id]': family_id }),
      })
      const c = await res.json()
      if (!res.ok) throw new Error(c.error?.message || 'Stripe customer error')
      customerId = c.id

      await fetch(`${SB_URL}/rest/v1/subscriptions`, {
        method: 'POST',
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ family_id, stripe_customer_id: customerId, plan: 'free', status: 'active' }),
      })
    }

    // Create checkout session
    const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${STRIPE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        customer:                                 customerId,
        mode:                                     'subscription',
        'payment_method_types[0]':                'card',
        'line_items[0][price]':                   PRICE_ID,
        'line_items[0][quantity]':                '1',
        'subscription_data[metadata][family_id]': family_id,
        'metadata[family_id]':                    family_id,
        success_url:                              success_url || `${OK}/?checkout=success`,
        cancel_url:                               cancel_url  || `${OK}/?checkout=cancel`,
        allow_promotion_codes:                    'true',
      }),
    })

    const session = await sessionRes.json()
    if (!sessionRes.ok) throw new Error(session.error?.message || 'Stripe session error')

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[create-checkout]', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
