alter table public.user_settings
  add column if not exists last_screen text not null default 'worldList',
  add column if not exists last_game_id uuid references public.games(id) on delete set null,
  add column if not exists last_world_id uuid references public.worlds(id) on delete set null,
  add column if not exists last_world_tab text not null default 'records';

alter table public.user_settings
  add constraint user_settings_last_screen_check check (last_screen in ('worldList', 'world')),
  add constraint user_settings_last_world_tab_check check (last_world_tab in ('records', 'wiki'));
