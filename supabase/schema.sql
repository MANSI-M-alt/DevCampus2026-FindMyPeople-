create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  department text not null default '',
  year text not null default 'Freshman',
  avatar text not null default '',
  bio text not null default '',
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  goal text not null default 'learn something new',
  free_slots text[] not null default '{}',
  is_phd_candidate boolean not null default false,
  research_specialization text,
  advisor_lab text,
  previous_projects jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  roles_needed text[] not null default '{}',
  goal text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.project_matches (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  match_score integer not null check (match_score between 0 and 100),
  reason text not null,
  complementary_skill text not null,
  goal_alignment text not null check (goal_alignment in ('strong', 'partial', 'weak')),
  goal_alignment_note text not null,
  risk text not null,
  interested_by_author boolean not null default false,
  interested_by_candidate boolean not null default false,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

create index if not exists projects_author_created_idx
  on public.projects (author_id, created_at desc);
create index if not exists project_matches_profile_idx
  on public.project_matches (profile_id);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_matches enable row level security;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update on public.project_matches to authenticated;
revoke all on public.profiles, public.projects, public.project_matches from anon;

drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
  on public.profiles for select to authenticated using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Authenticated users can view projects" on public.projects;
create policy "Authenticated users can view projects"
  on public.projects for select to authenticated using (true);

drop policy if exists "Users can create their own projects" on public.projects;
create policy "Users can create their own projects"
  on public.projects for insert to authenticated with check (auth.uid() = author_id);

drop policy if exists "Authors can update their projects" on public.projects;
create policy "Authors can update their projects"
  on public.projects for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "Authors can delete their projects" on public.projects;
create policy "Authors can delete their projects"
  on public.projects for delete to authenticated using (auth.uid() = author_id);

drop policy if exists "Participants can view project matches" on public.project_matches;
create policy "Participants can view project matches"
  on public.project_matches for select to authenticated
  using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.author_id = auth.uid()
    )
  );

drop policy if exists "Project authors can create matches" on public.project_matches;
create policy "Project authors can create matches"
  on public.project_matches for insert to authenticated
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.author_id = auth.uid()
    )
    and profile_id <> auth.uid()
  );

drop policy if exists "Participants can update match interest" on public.project_matches;
create policy "Participants can update match interest"
  on public.project_matches for update to authenticated
  using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.author_id = auth.uid()
    )
  )
  with check (
    auth.uid() = profile_id
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.author_id = auth.uid()
    )
  );

create or replace function public.guard_project_match_update()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  project_author_id uuid;
begin
  if new.project_id is distinct from old.project_id
    or new.profile_id is distinct from old.profile_id
    or new.match_score is distinct from old.match_score
    or new.reason is distinct from old.reason
    or new.complementary_skill is distinct from old.complementary_skill
    or new.goal_alignment is distinct from old.goal_alignment
    or new.goal_alignment_note is distinct from old.goal_alignment_note
    or new.risk is distinct from old.risk
  then
    raise exception 'Match details cannot be changed by participants';
  end if;

  select author_id into project_author_id
  from public.projects where id = old.project_id;

  if auth.uid() = project_author_id then
    if new.interested_by_candidate is distinct from old.interested_by_candidate then
      raise exception 'Project authors can only update their own interest';
    end if;
  elsif auth.uid() = old.profile_id then
    if new.interested_by_author is distinct from old.interested_by_author then
      raise exception 'Candidates can only update their own interest';
    end if;
  else
    raise exception 'Only match participants can update interest';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_project_match_update on public.project_matches;
create trigger guard_project_match_update
  before update on public.project_matches
  for each row execute procedure public.guard_project_match_update();

create or replace function public.get_mutual_match_emails(p_match_id uuid)
returns table (author_email text, candidate_email text)
language sql
security definer
set search_path = ''
as $$
  select author.email::text, candidate.email::text
  from public.project_matches m
  join public.projects p on p.id = m.project_id
  join auth.users author on author.id = p.author_id
  join auth.users candidate on candidate.id = m.profile_id
  where m.id = p_match_id
    and m.interested_by_author
    and m.interested_by_candidate
    and auth.uid() in (p.author_id, m.profile_id)
$$;

revoke all on function public.get_mutual_match_emails(uuid) from public;
grant execute on function public.get_mutual_match_emails(uuid) to authenticated;
