-- ─────────────────────────────────────────────────────────────
-- ChoreQuest — Complete Schema
-- Run once in Supabase → SQL Editor
-- ─────────────────────────────────────────────────────────────

-- Extensions
create extension if not exists "uuid-ossp";

-- ── Tables ────────────────────────────────────────────────────

create table if not exists families (
  id          uuid primary key default uuid_generate_v4(),
  parent_id   uuid references auth.users(id) on delete cascade,
  parent_name text not null,
  created_at  timestamptz default now()
);

create table if not exists kids (
  id          uuid primary key default uuid_generate_v4(),
  family_id   uuid references families(id) on delete cascade,
  name        text not null,
  age         int,
  avatar      text default '🦊',
  pin         text not null,
  balance     numeric(10,2) default 0,
  streak      int default 0,
  goal_name   text default 'My Goal',
  goal_target numeric(10,2) default 10,
  goal_saved  numeric(10,2) default 0,
  created_at  timestamptz default now()
);

create table if not exists chores (
  id          uuid primary key default uuid_generate_v4(),
  family_id   uuid references families(id) on delete cascade,
  kid_id      uuid references kids(id) on delete cascade,
  title       text not null,
  icon        text default '⚡',
  coins       numeric(10,2) default 0.50,
  done        boolean default false,
  pending     boolean default false,
  created_at  timestamptz default now()
);

create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  family_id   uuid references families(id) on delete cascade,
  kid_id      uuid references kids(id) on delete cascade,
  type        text default 'pending',
  message     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

create table if not exists redeemed_rewards (
  id          uuid primary key default uuid_generate_v4(),
  family_id   uuid references families(id) on delete cascade,
  kid_id      uuid references kids(id) on delete cascade,
  title       text not null,
  icon        text,
  cost        numeric(10,2),
  redeemed_at timestamptz default now()
);

create table if not exists weekly_history (
  id                uuid primary key default uuid_generate_v4(),
  family_id         uuid references families(id) on delete cascade,
  kid_id            uuid references kids(id) on delete cascade,
  week_label        text,
  earned            numeric(10,2) default 0,
  chores_completed  int default 0,
  total_chores      int default 0,
  redeemed          numeric(10,2) default 0,
  top_chore         text default '—',
  created_at        timestamptz default now()
);

create table if not exists subscriptions (
  id                     uuid primary key default uuid_generate_v4(),
  family_id              uuid references families(id) on delete cascade unique,
  stripe_customer_id     text,
  stripe_subscription_id text,
  plan                   text default 'free',
  status                 text default 'active',
  current_period_end     timestamptz,
  updated_at             timestamptz default now(),
  created_at             timestamptz default now()
);

create table if not exists push_subscriptions (
  id         uuid primary key default uuid_generate_v4(),
  family_id  uuid references families(id) on delete cascade,
  user_type  text default 'parent',
  kid_id     uuid references kids(id) on delete cascade,
  endpoint   text unique not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────

alter table families          enable row level security;
alter table kids               enable row level security;
alter table chores             enable row level security;
alter table notifications      enable row level security;
alter table redeemed_rewards   enable row level security;
alter table weekly_history     enable row level security;
alter table subscriptions      enable row level security;
alter table push_subscriptions enable row level security;

-- Families: parent owns their family
create policy "families_owner" on families for all
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

-- Kids: parent can do everything, anon can read (for kid login)
create policy "kids_parent" on kids for all
  using (family_id in (select id from families where parent_id = auth.uid()));

create policy "kids_anon_read" on kids for select to anon using (true);

-- Chores: parent full access, anon can read + mark pending
create policy "chores_parent" on chores for all
  using (family_id in (select id from families where parent_id = auth.uid()));

create policy "chores_anon_read" on chores for select to anon using (true);

create policy "chores_anon_pending" on chores for update to anon
  using (true)
  with check (pending = true and done = false);

-- Notifications: parent full access, anon can insert
create policy "notifs_parent" on notifications for all
  using (family_id in (select id from families where parent_id = auth.uid()));

create policy "notifs_anon_insert" on notifications for insert to anon with check (true);

-- Redeemed rewards: parent full access
create policy "rewards_parent" on redeemed_rewards for all
  using (family_id in (select id from families where parent_id = auth.uid()));

-- Weekly history: parent full access
create policy "history_parent" on weekly_history for all
  using (family_id in (select id from families where parent_id = auth.uid()));

-- Subscriptions: parent full access
create policy "subs_parent" on subscriptions for all
  using (family_id in (select id from families where parent_id = auth.uid()));

-- Push subscriptions: parent full access
create policy "push_parent" on push_subscriptions for all
  using (family_id in (select id from families where parent_id = auth.uid()));
