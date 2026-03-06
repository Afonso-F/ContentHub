-- ── Função de reset completo (contorna RLS) ──────────────────────
-- Corre como SECURITY DEFINER (privilégios do owner) para apagar
-- todos os dados independentemente das políticas RLS configuradas.

create or replace function reset_all_data()
returns void
language plpgsql
security definer
as $$
begin
  -- Apagar por ordem FK-safe (filhos antes dos pais)
  delete from fansly_stats       where id is not null;
  delete from onlyfans_stats     where avatar_id is not null or id is not null;
  delete from patreon_stats      where id is not null;
  delete from twitch_stats       where id is not null;
  delete from afiliados          where id is not null;
  delete from vendas_diretas     where id is not null;
  delete from levantamentos      where id is not null;
  delete from contas_bancarias   where id is not null;
  delete from publicados         where id is not null;
  delete from musico_tracks      where id is not null;
  delete from episodios          where id is not null;
  delete from posts              where id is not null;
  delete from contas             where id is not null;
  delete from youtube_videos     where id is not null;
  delete from youtube_channels   where id is not null;
  delete from musicos            where id is not null;
  delete from podcasts           where id is not null;
  delete from campanhas          where id is not null;
  delete from despesas           where id is not null;
  delete from prompt_library     where id is not null;
  delete from avatares           where id is not null;
exception
  when undefined_table then
    null; -- ignora tabelas que não existam
end;
$$;

-- Permitir que qualquer utilizador (incluindo anon) chame esta função
grant execute on function reset_all_data() to anon, authenticated;
