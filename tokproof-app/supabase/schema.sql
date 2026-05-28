-- ─────────────────────────────────────────────
--  Tokproof — Complete Supabase Schema + RLS
--  Run this in: Supabase → SQL Editor → New query
-- ─────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ═══════════════════════════════════════════════
--  TABLES
-- ═══════════════════════════════════════════════

-- PROFILES
create table if not exists profiles (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  username      text unique,
  display_name  text,
  email         text,
  avatar_url    text,
  plan          text not null default 'free' check (plan in ('free', 'pro')),
  onboarding_completed boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- PAGES
create table if not exists pages (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  username      text,
  type          text not null default 'trust' check (type in ('simple', 'trust')),
  status        text not null default 'draft' check (status in ('draft', 'in_review', 'published', 'blocked')),
  title         text,
  brand_name    text,
  product_name  text,
  shopify_url   text,
  slug          text,
  settings      jsonb not null default '{}',
  safe_score    integer not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  published_at  timestamptz
);

create index if not exists pages_user_id_idx    on pages(user_id);
create index if not exists pages_username_idx   on pages(username);
create index if not exists pages_status_idx     on pages(status);

-- BUTTONS
create table if not exists buttons (
  id          uuid primary key default uuid_generate_v4(),
  page_id     uuid references pages(id) on delete cascade not null,
  label       text not null default 'Botón',
  url         text,
  type        text not null default 'link' check (type in ('link','whatsapp','shopify','instagram','tiktok','youtube','email')),
  icon        text,
  sort_order  integer not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz default now()
);

create index if not exists buttons_page_id_idx on buttons(page_id);

-- COMMENTS (TikTok comments displayed on trust pages)
create table if not exists comments (
  id           uuid primary key default uuid_generate_v4(),
  page_id      uuid references pages(id) on delete cascade not null,
  name         text,
  username     text,
  avatar       text,
  text         text,
  likes        integer not null default 0,
  image_url    text,
  brand_reply  text,
  is_visible   boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz default now()
);

create index if not exists comments_page_id_idx on comments(page_id);

-- REVIEWS
create table if not exists reviews (
  id          uuid primary key default uuid_generate_v4(),
  page_id     uuid references pages(id) on delete cascade not null,
  name        text,
  rating      integer not null default 5 check (rating >= 1 and rating <= 5),
  text        text,
  date        text,
  verified    boolean not null default false,
  image_url   text,
  is_visible  boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz default now()
);

create index if not exists reviews_page_id_idx on reviews(page_id);

-- FAQS
create table if not exists faqs (
  id          uuid primary key default uuid_generate_v4(),
  page_id     uuid references pages(id) on delete cascade not null,
  question    text,
  answer      text,
  is_visible  boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz default now()
);

-- LOGOS (Visto en / As seen on)
create table if not exists logos (
  id          uuid primary key default uuid_generate_v4(),
  page_id     uuid references pages(id) on delete cascade not null,
  name        text,
  image_url   text,
  is_visible  boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz default now()
);

-- EVENTS (analytics — public insert, owner read)
create table if not exists events (
  id          uuid primary key default uuid_generate_v4(),
  page_id     uuid references pages(id) on delete cascade,
  user_id     uuid,
  event_type  text not null check (event_type in ('page_view','button_click','shopify_click','cta_click')),
  button_id   uuid,
  referrer    text,
  user_agent  text,
  device      text,
  browser     text,
  country     text,
  created_at  timestamptz default now()
);

create index if not exists events_page_id_idx    on events(page_id);
create index if not exists events_created_at_idx on events(created_at desc);
create index if not exists events_type_idx       on events(event_type);

-- TEMPLATES
create table if not exists templates (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  type        text not null check (type in ('simple', 'trust')),
  category    text,
  preview_url text,
  settings    jsonb not null default '{}',
  is_active   boolean not null default true,
  created_at  timestamptz default now()
);

-- ═══════════════════════════════════════════════
--  UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════════

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger pages_updated_at before update on pages
  for each row execute function update_updated_at();

-- ═══════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════

alter table profiles  enable row level security;
alter table pages     enable row level security;
alter table buttons   enable row level security;
alter table comments  enable row level security;
alter table reviews   enable row level security;
alter table faqs      enable row level security;
alter table logos     enable row level security;
alter table events    enable row level security;
alter table templates enable row level security;

-- ── PROFILES ────────────────────────────────────

-- Anyone can read any profile (needed for /@username public pages)
create policy "profiles_public_read" on profiles
  for select using (true);

-- Only the owner can insert their profile
create policy "profiles_owner_insert" on profiles
  for insert with check (auth.uid() = user_id);

-- Only the owner can update their profile
create policy "profiles_owner_update" on profiles
  for update using (auth.uid() = user_id);

-- ── PAGES ────────────────────────────────────────

-- Owner can read all their pages (any status)
create policy "pages_owner_read" on pages
  for select using (auth.uid() = user_id);

-- Public can read published pages
create policy "pages_public_read_published" on pages
  for select using (status = 'published');

-- Owner can insert
create policy "pages_owner_insert" on pages
  for insert with check (auth.uid() = user_id);

-- Owner can update
create policy "pages_owner_update" on pages
  for update using (auth.uid() = user_id);

-- Owner can delete
create policy "pages_owner_delete" on pages
  for delete using (auth.uid() = user_id);

-- ── BUTTONS / COMMENTS / REVIEWS / FAQS / LOGOS ─
-- Owner can CRUD via page ownership; public can read items of published pages

-- Helper: is this page_id owned by the current user?
create or replace function is_page_owner(p_page_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from pages where id = p_page_id and user_id = auth.uid()
  );
$$;

-- Helper: is this page published?
create or replace function is_page_published(p_page_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from pages where id = p_page_id and status = 'published'
  );
$$;

-- BUTTONS
create policy "buttons_owner_all" on buttons
  for all using (is_page_owner(page_id));

create policy "buttons_public_read" on buttons
  for select using (is_page_published(page_id) and is_visible = true);

-- COMMENTS
create policy "comments_owner_all" on comments
  for all using (is_page_owner(page_id));

create policy "comments_public_read" on comments
  for select using (is_page_published(page_id) and is_visible = true);

-- REVIEWS
create policy "reviews_owner_all" on reviews
  for all using (is_page_owner(page_id));

create policy "reviews_public_read" on reviews
  for select using (is_page_published(page_id) and is_visible = true);

-- FAQS
create policy "faqs_owner_all" on faqs
  for all using (is_page_owner(page_id));

create policy "faqs_public_read" on faqs
  for select using (is_page_published(page_id) and is_visible = true);

-- LOGOS
create policy "logos_owner_all" on logos
  for all using (is_page_owner(page_id));

create policy "logos_public_read" on logos
  for select using (is_page_published(page_id) and is_visible = true);

-- ── EVENTS ───────────────────────────────────────

-- Public visitors can insert events (analytics tracking)
create policy "events_public_insert" on events
  for insert with check (true);

-- Page owners can read their own events
create policy "events_owner_read" on events
  for select using (
    auth.uid() in (
      select user_id from pages where pages.id = events.page_id
    )
  );

-- ── TEMPLATES ────────────────────────────────────

-- Anyone can read active templates
create policy "templates_public_read" on templates
  for select using (is_active = true);

-- ═══════════════════════════════════════════════
--  SEED TEMPLATES
-- ═══════════════════════════════════════════════

insert into templates (name, type, category, settings) values
  ('TikTok Beauty',   'trust',  'Skincare',  '{"brand_color":"#FF2D75","cta_text":"Comprar ahora →","show_comments":true,"show_reviews":true,"cta_sticky":true}'),
  ('Gadgets & Tech',  'trust',  'Tech',      '{"brand_color":"#22C55E","cta_text":"Ver producto →","show_comments":true,"show_reviews":true,"cta_sticky":true}'),
  ('Pets & Lifestyle','trust',  'Lifestyle', '{"brand_color":"#F59E0B","cta_text":"Lo quiero →","show_comments":true,"show_reviews":true}'),
  ('Info Product',    'trust',  'Digital',   '{"brand_color":"#A855F7","cta_text":"Acceder ahora →","show_faq":true,"show_guarantees":true}'),
  ('Fashion Creator', 'simple', 'Creator',   '{"brand_color":"#3B82F6","bio":"Creadora de moda y lifestyle"}'),
  ('Minimal Creator', 'simple', 'Minimal',   '{"brand_color":"#FFFFFF","bio":"Links de tu mundo"}')
on conflict do nothing;
