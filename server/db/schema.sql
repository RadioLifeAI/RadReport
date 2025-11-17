create extension if not exists pgcrypto;

create table if not exists users(
  user_id uuid primary key,
  email text unique not null,
  name text,
  picture text,
  updated_at timestamptz not null default now()
);

create unique index if not exists users_email_lower_unique on users(lower(email));

create table if not exists user_providers(
  user_id uuid references users(user_id) on delete cascade,
  provider text not null,
  provider_id text not null,
  updated_at timestamptz not null default now(),
  primary key(user_id, provider)
);

create table if not exists users_auth(
  user_id uuid primary key references users(user_id) on delete cascade,
  password_hash text not null,
  password_version smallint not null default 1,
  failed_attempts int not null default 0,
  locked_until timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_log(
  op_id uuid primary key,
  entity text not null,
  entity_id uuid,
  op_type text not null,
  payload jsonb,
  device_id text,
  user_id uuid,
  ts timestamptz not null default now()
);

create table if not exists outbox(
  op_id uuid primary key,
  delivered boolean not null default false,
  ts timestamptz not null default now()
);

create table if not exists sync_state(
  id int primary key default 1,
  last_pushed_at timestamptz,
  last_pulled_at timestamptz,
  last_seen_cloud_version bigint not null default 0
);

create table if not exists audit_log_cloud(
  op_id uuid primary key,
  entity text not null,
  entity_id uuid,
  op_type text not null,
  payload jsonb,
  device_id text,
  user_id uuid,
  ts timestamptz not null default now()
);