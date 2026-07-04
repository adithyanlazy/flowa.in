-- Run this once in Supabase SQL Editor (Project > SQL Editor > New query)

create table if not exists store_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table store_state enable row level security;

create policy "public read" on store_state
  for select using (true);

create policy "public upsert" on store_state
  for insert with check (true);

create policy "public update" on store_state
  for update using (true);

-- enable realtime so other devices get live pushes
alter publication supabase_realtime add table store_state;

-- seed the single shared row (app will also create it on first save if missing)
insert into store_state (id, data)
values ('flowa', '{}'::jsonb)
on conflict (id) do nothing;
