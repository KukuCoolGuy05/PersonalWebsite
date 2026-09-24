-- ─────────────────────────────────────────────────────────────
-- Coding-problems log for the personal website.
-- Run once in Supabase → SQL Editor → New query. Safe to re-run.
-- Everyone can read; only accounts listed in public.admins can write.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.problems (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 200),
  number      integer check (number is null or number > 0),
  source      text,
  url         text check (url is null or url ~* '^https?://'),
  difficulty  text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  tags        text[] not null default '{}',
  solved_on   date not null default current_date,
  question    text not null default '',
  insight     text not null default '',
  approach    text not null default '',
  -- [{ "label", "language", "time", "space", "code" }, …]
  solutions   jsonb not null default '[]'::jsonb check (jsonb_typeof(solutions) = 'array'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists problems_solved_on_idx on public.problems (solved_on desc, created_at desc);
create index if not exists problems_tags_idx on public.problems using gin (tags);

-- Keep updated_at current on every edit.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists problems_set_updated_at on public.problems;
create trigger problems_set_updated_at
  before update on public.problems
  for each row execute function public.set_updated_at();

-- ── Who may edit ─────────────────────────────────────────────
-- Add yourself after creating your user in Authentication → Users:
--   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- RLS on with no policies: the admins list can't be read or changed through the API.
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ── Row-level security ───────────────────────────────────────
alter table public.problems enable row level security;

drop policy if exists "Anyone can read problems" on public.problems;
create policy "Anyone can read problems"
  on public.problems for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can add problems" on public.problems;
create policy "Admins can add problems"
  on public.problems for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit problems" on public.problems;
create policy "Admins can edit problems"
  on public.problems for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete problems" on public.problems;
create policy "Admins can delete problems"
  on public.problems for delete
  to authenticated
  using ((select public.is_admin()));

grant select on public.problems to anon, authenticated;
grant insert, update, delete on public.problems to authenticated;

-- ── Tags ─────────────────────────────────────────────────────
-- The tag list on the Coding page: each tag's name, color and description.
-- Problems store tag names in problems.tags.
create table if not exists public.tags (
  name        text primary key check (
                char_length(name) between 1 and 40
                and name = btrim(name)
                and position(',' in name) = 0
              ),
  hue         smallint not null default 250 check (hue between 0 and 359),
  description text not null default '',
  created_at  timestamptz not null default clock_timestamp()
);

-- "Heap" and "heap" count as the same tag.
create unique index if not exists tags_name_lower_idx on public.tags (lower(name));

alter table public.tags enable row level security;

drop policy if exists "Anyone can read tags" on public.tags;
create policy "Anyone can read tags"
  on public.tags for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can add tags" on public.tags;
create policy "Admins can add tags"
  on public.tags for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit tags" on public.tags;
create policy "Admins can edit tags"
  on public.tags for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete tags" on public.tags;
create policy "Admins can delete tags"
  on public.tags for delete
  to authenticated
  using ((select public.is_admin()));

grant select on public.tags to anon, authenticated;
grant insert, update, delete on public.tags to authenticated;

-- Starter tags: the core data structures. Only added while the table is empty,
-- so re-running this file never brings back tags you've deleted.
insert into public.tags (name, hue, description, created_at)
select name, hue, description, now() + ord * interval '1 millisecond'
from (values
  (1, 'Array', 212, 'Contiguous, index-based storage'),
  (2, 'String', 168, 'Sequences of characters'),
  (3, 'Hash Table', 42, 'Hash maps & sets — O(1) average lookup'),
  (4, 'Linked List', 282, 'Nodes chained by pointers'),
  (5, 'Stack', 22, 'Last in, first out'),
  (6, 'Queue', 190, 'First in, first out (incl. deques)'),
  (7, 'Heap', 336, 'Priority queues — fast min / max'),
  (8, 'Tree', 130, 'Hierarchical nodes, binary trees'),
  (9, 'Binary Search Tree', 90, 'Ordered binary trees'),
  (10, 'Graph', 250, 'Vertices & edges — BFS, DFS, paths'),
  (11, 'Trie', 305, 'Prefix trees for strings'),
  (12, 'Matrix', 0, '2-D grids')
) as starter(ord, name, hue, description)
where not exists (select 1 from public.tags);
