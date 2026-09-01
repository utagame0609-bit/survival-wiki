import { supabase } from './supabase';

export type UserLastWorldTab = 'records' | 'wiki';
export type UserLastScreen = 'worldList' | 'world';

export type UserLastView = {
  screen: UserLastScreen;
  gameId: string | null;
  worldId: string | null;
  worldTab: UserLastWorldTab;
};

export async function loadUserLastView(): Promise<UserLastView | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('last_screen, last_game_id, last_world_id, last_world_tab')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    screen: data.last_screen === 'world' ? 'world' : 'worldList',
    gameId: data.last_game_id ?? null,
    worldId: data.last_world_id ?? null,
    worldTab: data.last_world_tab === 'wiki' ? 'wiki' : 'records',
  };
}

async function saveUserLastView(view: UserLastView): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: user.id,
        last_screen: view.screen,
        last_game_id: view.gameId,
        last_world_id: view.worldId,
        last_world_tab: view.worldTab,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  if (error) throw error;
}

export function saveUserWorldListView(gameId: string): Promise<void> {
  return saveUserLastView({
    screen: 'worldList',
    gameId,
    worldId: null,
    worldTab: 'records',
  });
}

export function saveUserWorldView(gameId: string, worldId: string, worldTab: UserLastWorldTab): Promise<void> {
  return saveUserLastView({
    screen: 'world',
    gameId,
    worldId,
    worldTab,
  });
}
