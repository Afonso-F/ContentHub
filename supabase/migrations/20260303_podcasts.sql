-- ============================================================
-- Podcasts — tabelas podcasts e episodios
-- ============================================================

-- ── Tabela: podcasts ─────────────────────────────────────────
create table if not exists podcasts (
  id          uuid primary key default gen_random_uuid(),
  avatar_id   uuid references avatares(id) on delete set null,
  nome        text not null,
  descricao   text,
  cover_url   text,
  categorias  text[] default '{}',
  plataformas text[] default '{}',
  rss_url     text,
  site_url    text,
  criado_em   timestamptz default now(),
  atualizado_em timestamptz default now()
);

create index if not exists podcasts_avatar_id_idx on podcasts(avatar_id);

-- ── Tabela: episodios ────────────────────────────────────────
create table if not exists episodios (
  id            uuid primary key default gen_random_uuid(),
  podcast_id    uuid references podcasts(id) on delete cascade not null,
  titulo        text not null,
  descricao     text,
  numero        integer,
  temporada     integer default 1,
  audio_url     text,
  video_url     text,
  thumbnail_url text,
  duracao       integer,              -- segundos
  status        text default 'rascunho' check (status in ('rascunho','agendado','publicado','erro')),
  agendado_para timestamptz,
  plataformas   text[] default '{}',
  notas         text,
  criado_em     timestamptz default now(),
  atualizado_em timestamptz default now()
);

create index if not exists episodios_podcast_id_idx   on episodios(podcast_id);
create index if not exists episodios_status_idx       on episodios(status);
create index if not exists episodios_agendado_para_idx on episodios(agendado_para);

-- ── RLS ──────────────────────────────────────────────────────
alter table podcasts  enable row level security;
alter table episodios enable row level security;

create policy "Allow all for authenticated" on podcasts
  for all using (true) with check (true);

create policy "Allow all for authenticated" on episodios
  for all using (true) with check (true);

-- ── Trigger: atualizar timestamp ──────────────────────────────
create trigger podcasts_updated before update on podcasts
  for each row execute function update_atualizado_em();

create trigger episodios_updated before update on episodios
  for each row execute function update_atualizado_em();

-- ── Storage: podcast-audio ───────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'podcast-audio',
  'podcast-audio',
  true,
  524288000,
  ARRAY['audio/mpeg','audio/mp3','audio/mp4','audio/wav','audio/ogg','audio/flac','audio/aac','audio/x-m4a']
) on conflict (id) do nothing;

create policy "Public read podcast-audio"
  on storage.objects for select to public
  using (bucket_id = 'podcast-audio');

create policy "Auth upload podcast-audio"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'podcast-audio');

create policy "Auth update podcast-audio"
  on storage.objects for update to authenticated
  using (bucket_id = 'podcast-audio')
  with check (bucket_id = 'podcast-audio');

create policy "Auth delete podcast-audio"
  on storage.objects for delete to authenticated
  using (bucket_id = 'podcast-audio');

-- ── Storage: podcast-covers ──────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'podcast-covers',
  'podcast-covers',
  true,
  10485760,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp']
) on conflict (id) do nothing;

create policy "Public read podcast-covers"
  on storage.objects for select to public
  using (bucket_id = 'podcast-covers');

create policy "Auth upload podcast-covers"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'podcast-covers');

create policy "Auth update podcast-covers"
  on storage.objects for update to authenticated
  using (bucket_id = 'podcast-covers')
  with check (bucket_id = 'podcast-covers');

create policy "Auth delete podcast-covers"
  on storage.objects for delete to authenticated
  using (bucket_id = 'podcast-covers');
