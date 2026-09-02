alter table public.wiki_articles
  add column if not exists scope_type text not null default 'world',
  add column if not exists scope_key text not null default 'all';

alter table public.wiki_articles
  drop constraint if exists wiki_articles_world_id_style_key;

alter table public.wiki_articles
  drop constraint if exists wiki_articles_scope_type_check;

alter table public.wiki_articles
  add constraint wiki_articles_scope_type_check
  check (scope_type in ('month', 'year', 'world'));

alter table public.wiki_articles
  drop constraint if exists wiki_articles_scope_key_check;

alter table public.wiki_articles
  add constraint wiki_articles_scope_key_check
  check (
    (scope_type = 'world' and scope_key = 'all')
    or (scope_type = 'year' and scope_key ~ '^[0-9]{4}$')
    or (scope_type = 'month' and scope_key ~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
  );

alter table public.wiki_articles
  drop constraint if exists wiki_articles_world_id_style_scope_type_key;

alter table public.wiki_articles
  add constraint wiki_articles_world_id_style_scope_type_key
  unique (world_id, style, scope_type);
