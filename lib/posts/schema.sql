-- posts: source of truth for blog articles
-- Run against Neon (SQL Editor or psql). post_chunks comes in the RAG tranche.

create extension if not exists "pgcrypto";

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  content text not null, -- markdown body
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  summary text, -- nullable; optional / auto-generated later
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_slug_unique unique (slug)
);

create index if not exists posts_status_idx on posts (status);
create index if not exists posts_created_at_idx on posts (created_at desc);

-- Keep updated_at fresh on UPDATE
create or replace function set_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on posts;
create trigger posts_set_updated_at
  before update on posts
  for each row
  execute function set_posts_updated_at();
