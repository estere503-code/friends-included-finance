create table if not exists employees (
  role text primary key check (role in ('svetlana','richard','anastasia','jean_claude','kevin')),
  name text not null, telegram_user_id text unique, telegram_chat_id text
);
insert into employees (role,name) values ('svetlana','Svetlana de Monte Carlo'),('richard','Richard Darling'),('anastasia','Anastasia Ferrari'),('jean_claude','Jean-Claude Bērziņš'),('kevin','Kevin von Whatever') on conflict (role) do nothing;
create table if not exists sales (
  id uuid primary key default gen_random_uuid(), reference text unique not null, submitted_at timestamptz not null default now(), salesperson text not null check (salesperson in ('richard','anastasia','jean_claude')), customer text not null, project text not null check (project in ('A','B')), description text not null, amount numeric not null check(amount>0), proposed_split jsonb not null, approved_split jsonb, commissions jsonb, status text not null default 'pending' check(status in ('pending','approved')), notification_chat_id text, notification_status text default 'not_required', sync_status text default 'sync_pending'
);
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(), reference text unique not null, submitted_at timestamptz not null default now(), reporter text not null default 'kevin' check(reporter='kevin'), description text not null, category text not null check(category in ('Materials','Travel','Other')), amount numeric not null check(amount>0), proposed_allocation text not null check(proposed_allocation in ('A','B','overhead')), final_allocation text check(final_allocation in ('A','B','overhead')), status text not null check(status in ('awaiting_allocation','allocated')), notification_chat_id text, notification_status text default 'not_required', sync_status text default 'sync_pending'
);
