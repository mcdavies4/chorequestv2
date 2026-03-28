import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

// Simple HMAC-SHA256 verification for Stripe webhook
async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts  = sigHeader.split(',').reduce((acc, p) => { const [k, v] = p.split('='); acc[k] = v; return acc }, {} as Record<string, string>)
  const ts     = parts['t']
  const sig    = parts['v1']
  if (!ts || !sig) return false

  const signed = `${ts}.${payload}`
  const key    = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac    = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed))
  const hex    = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('')
  return hex === sig
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const SB_URL         = Deno.env.get('SUPABASE_URL')
  const SB_KEY         = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') || ''

  if (WEBHOOK_SECRET) {
    const valid = await verifyStripeSignature(body, sig, WEBHOOK_SECRET)
    if (!valid) return new Response('Invalid signature', { status: 400 })
  }

  let event: any
  try { event = JSON.parse(body) } catch { return new Response('Invalid JSON', { status: 400 }) }

  const sbHeaders = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }

  const updateSub = async (filter: string, updates: object) => {
    await fetch(`${SB_URL}/rest/v1/subscriptions?${filter}`, {
      method: 'PATCH', headers: sbHeaders, body: JSON.stringify(updates),
    })
  }

  try {
    const obj = event.data?.object

    if (event.type === 'checkout.session.completed' && obj.mode === 'subscription') {
      const familyId = obj.metadata?.family_id
      if (familyId) {
        await fetch(`${SB_URL}/rest/v1/subscriptions`, {
          method: 'POST',
          headers: { ...sbHeaders, Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify({
            family_id:              familyId,
            stripe_customer_id:     obj.customer,
            stripe_subscription_id: obj.subscription,
            plan:   'premium',
            status: 'active',
          }),
        })
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const active = ['active','trialing'].includes(obj.status)
      await updateSub(`stripe_customer_id=eq.${obj.customer}`, {
        plan:                   active ? 'premium' : 'free',
        status:                 obj.status,
        stripe_subscription_id: obj.id,
      })
    }

    if (event.type === 'customer.subscription.deleted') {
      await updateSub(`stripe_customer_id=eq.${obj.customer}`, { plan: 'free', status: 'canceled' })
    }

    if (event.type === 'invoice.payment_failed') {
      await updateSub(`stripe_customer_id=eq.${obj.customer}`, { status: 'past_due' })
    }

    if (event.type === 'invoice.payment_succeeded' && obj.billing_reason !== 'subscription_create') {
      await updateSub(`stripe_customer_id=eq.${obj.customer}`, { status: 'active' })
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[stripe-webhook]', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
