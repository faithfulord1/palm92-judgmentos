-- Palm92 JudgmentOS future-ready persistence model
create extension if not exists pgcrypto;

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  title text not null,
  product text not null,
  risk_level text not null check (risk_level in ('low','medium','high','critical')),
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists delegation_contracts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  outcome text not null,
  authoritative_context jsonb not null default '[]'::jsonb,
  prohibited_assumptions jsonb not null default '[]'::jsonb,
  permitted_actions jsonb not null default '[]'::jsonb,
  approval_requirements jsonb not null default '{}'::jsonb,
  verification_method text not null,
  rollback_plan text not null,
  stop_conditions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists evidence_items (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  kind text not null,
  claim text not null,
  source_name text not null,
  source_location text,
  confidence numeric check (confidence between 0 and 100),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists analysis_findings (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  finding_type text not null,
  finding text not null,
  consequence text,
  created_at timestamptz not null default now()
);

create table if not exists verification_checks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  label text not null,
  required boolean not null default true,
  passed boolean not null default false,
  verified_by text,
  verified_at timestamptz
);

create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  actor text not null,
  decision text not null,
  reason text not null,
  previous_state text,
  new_state text,
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  actor text not null,
  actor_type text not null,
  action text not null,
  previous_state text,
  new_state text,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists evaluation_metrics (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id) on delete cascade,
  first_pass_accepted boolean,
  correction_minutes numeric not null default 0,
  error_rate numeric not null default 0,
  exception_rate numeric not null default 0,
  approval_turnaround_hours numeric,
  estimated_hours_saved numeric not null default 0,
  recommendation text check (recommendation in ('continue','improve','stop')),
  measured_at timestamptz not null default now()
);
