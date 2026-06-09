-- SOASA Executive Election schema
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists "pgcrypto";

-- Singleton election window & title
create table if not exists election_config (
  id int primary key default 1 check (id = 1),
  title text not null default 'SOASA Executive Elections',
  opens_at timestamptz,
  closes_at timestamptz,
  results_published boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into election_config (id, title)
values (1, 'SOASA Executive Elections 2026/2027')
on conflict (id) do nothing;

-- Eligible voters (you import this list)
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  index_number text not null,
  full_name text not null,
  level text,
  password_hash text not null,
  has_voted boolean not null default false,
  voted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint students_index_number_unique unique (index_number)
);

create index if not exists students_index_number_idx on students (lower(index_number));

-- Offices on the ballot
create table if not exists positions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  sort_order int not null default 0,
  max_winners int not null default 1
);

-- Candidates per office
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  position_id uuid not null references positions (id) on delete cascade,
  full_name text not null,
  photo_url text,
  manifesto_url text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- One row per student per office (candidate_id null = abstain)
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  position_id uuid not null references positions (id) on delete cascade,
  candidate_id uuid references candidates (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint votes_student_position_unique unique (student_id, position_id)
);

create index if not exists votes_position_idx on votes (position_id);
create index if not exists votes_candidate_idx on votes (candidate_id);

-- Seed standard SOASA executive positions
-- President and Vice President are one ticket (one vote per pair).
-- PRO and Organizer positions have main + deputy (voted separately)
insert into positions (slug, title, sort_order) values
  ('president-vp', 'President & Vice President', 10),
  ('secretary', 'Secretary', 20),
  ('treasurer', 'Treasurer / Financial Secretary', 30),
  ('pro', 'Public Relations Officer (Main)', 40),
  ('deputy-pro', 'Public Relations Officer (Deputy)', 50),
  ('organizer', 'Organizer (Main)', 60),
  ('deputy-organizer', 'Organizer (Deputy)', 70),
  ('welfare', 'Welfare Chairperson', 80),
  ('electoral-commissioner', 'Electoral Commissioner', 90)
on conflict (slug) do nothing;

-- Atomic ballot submission (prevents double voting)
create or replace function submit_ballot(
  p_student_id uuid,
  p_choices jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg election_config%rowtype;
  choice jsonb;
  pos_id uuid;
  cand_id uuid;
begin
  select * into cfg from election_config where id = 1;

  if cfg.opens_at is not null and now() < cfg.opens_at then
    raise exception 'election_not_open';
  end if;
  if cfg.closes_at is not null and now() > cfg.closes_at then
    raise exception 'election_closed';
  end if;

  if not exists (
    select 1 from students where id = p_student_id and has_voted = false
  ) then
    raise exception 'already_voted';
  end if;

  if jsonb_typeof(p_choices) <> 'array' or jsonb_array_length(p_choices) = 0 then
    raise exception 'empty_ballot';
  end if;

  for choice in select * from jsonb_array_elements(p_choices)
  loop
    pos_id := (choice->>'position_id')::uuid;
    if choice ? 'candidate_id' and choice->>'candidate_id' is not null then
      cand_id := (choice->>'candidate_id')::uuid;
      if not exists (
        select 1 from candidates c
        where c.id = cand_id and c.position_id = pos_id and c.is_active = true
      ) then
        raise exception 'invalid_candidate';
      end if;
    else
      cand_id := null;
    end if;

    if not exists (select 1 from positions where id = pos_id) then
      raise exception 'invalid_position';
    end if;

    insert into votes (student_id, position_id, candidate_id)
    values (p_student_id, pos_id, cand_id);
  end loop;

  update students
  set has_voted = true, voted_at = now()
  where id = p_student_id;
end;
$$;

-- Turnout & tallies (admin only via service role)
create or replace view election_turnout as
select
  (select count(*) from students) as total_eligible,
  (select count(*) from students where has_voted) as total_voted,
  case
    when (select count(*) from students) = 0 then 0
    else round(
      100.0 * (select count(*) from students where has_voted)
      / (select count(*) from students),
      1
    )
  end as turnout_percent;

create or replace view election_results as
select
  p.id as position_id,
  p.slug,
  p.title as position_title,
  c.id as candidate_id,
  c.full_name as candidate_name,
  count(v.id) filter (where v.candidate_id is not null) as vote_count
from positions p
left join candidates c on c.position_id = p.id and c.is_active = true
left join votes v on v.candidate_id = c.id and v.position_id = p.id
group by p.id, p.slug, p.title, p.sort_order, c.id, c.full_name, c.sort_order
order by p.sort_order, c.sort_order nulls last;

-- Block direct client access; API uses service role
alter table students enable row level security;
alter table votes enable row level security;
alter table candidates enable row level security;
alter table positions enable row level security;
alter table election_config enable row level security;
