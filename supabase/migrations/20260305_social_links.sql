-- ============================================================
-- Social links para músicos, podcasts e canais YouTube
-- Armazena URLs/handles por plataforma diretamente no registo
-- ============================================================

-- Músicos: links para perfis de streaming (Spotify, Apple Music, etc.)
alter table musicos
  add column if not exists links_sociais jsonb default '{}';

-- Podcasts: links de distribuição por plataforma (Spotify, Apple Podcasts, etc.)
alter table podcasts
  add column if not exists links_sociais jsonb default '{}';

-- Canais YouTube: username/handle além do canal_id
alter table youtube_channels
  add column if not exists username text;
