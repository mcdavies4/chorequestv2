# ChoreQuest — Setup Guide

## 1. Supabase Setup

### Create project
Go to supabase.com → New Project

### Run the schema
Supabase Dashboard → SQL Editor → paste `schema.sql` → Run

### Turn off email confirmation
Supabase → Authentication → Providers → Email → turn OFF "Confirm email"

### Add your env vars
Copy your project URL and anon key from Supabase → Settings → API

## 2. Create .env file
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Stripe Setup

### Create product
Stripe Dashboard → Products → Add Product
- Name: ChoreQuest Premium
- Price: $9.99/month recurring
- Copy the Price ID (starts with price_)

### Create webhook
Stripe → Developers → Webhooks → Add Endpoint
- URL: https://YOUR-PROJECT.supabase.co/functions/v1/stripe-webhook
- Events: checkout.session.completed, customer.subscription.updated,
  customer.subscription.deleted, invoice.payment_failed, invoice.payment_succeeded
- Copy the Signing Secret (starts with whsec_)

### Add Supabase secrets
Supabase → Edge Functions → Secrets:
- STRIPE_SECRET_KEY = sk_test_... (from Stripe → Developers → API Keys)
- STRIPE_PRICE_ID = price_... (from your product)
- STRIPE_WEBHOOK_SECRET = whsec_... (from your webhook)

### Turn off JWT verification on Edge Functions
Supabase → Edge Functions → create-checkout → Settings → JWT verification OFF
Supabase → Edge Functions → create-portal → Settings → JWT verification OFF

### Deploy Edge Functions
Paste each file in supabase/functions/ into the Supabase Dashboard editor:
- create-checkout → supabase/functions/create-checkout/index.ts
- create-portal → supabase/functions/create-portal/index.ts
- stripe-webhook → supabase/functions/stripe-webhook/index.ts

## 4. Deploy to Vercel

```bash
npm install
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR/chorequest.git
git push -u origin main
```

Vercel → Import repo → Add environment variables:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Deploy!

## 5. Test Stripe
Use card: 4242 4242 4242 4242 | Expiry: 12/26 | CVC: 123 | ZIP: 12345
