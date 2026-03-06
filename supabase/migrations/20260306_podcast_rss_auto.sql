-- ============================================================
-- Podcast RSS auto-publish field
-- ============================================================

alter table podcasts
  add column if not exists rss_auto_publicar boolean default false;
