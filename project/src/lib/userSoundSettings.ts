import { supabase } from './supabase';

let bgmSaveQueue: Promise<void> = Promise.resolve();

export type UserSoundSettings = {
  seVolume: number;
  seReverb: number;
};

const DEFAULT_SETTINGS: UserSoundSettings = {
  seVolume: 30,
  seReverb: 30,
};

export async function loadUserSoundSettings(): Promise<UserSoundSettings> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return DEFAULT_SETTINGS;

  const { data, error } = await supabase
    .from('user_settings')
    .select('se_volume, se_reverb')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const { data: created, error: createError } = await supabase
      .from('user_settings')
      .insert({ user_id: user.id })
      .select('se_volume, se_reverb')
      .single();

    if (createError) throw createError;

    return {
      seVolume: created.se_volume,
      seReverb: created.se_reverb,
    };
  }

  return {
    seVolume: data.se_volume,
    seReverb: data.se_reverb,
  };
}

export async function saveUserSoundSettings(settings: UserSoundSettings): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: user.id,
        se_volume: Math.min(100, Math.max(0, Math.round(settings.seVolume))),
        se_reverb: Math.min(100, Math.max(0, Math.round(settings.seReverb))),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  if (error) throw error;
}

export async function loadUserBgmVolume(): Promise<number> {
  await bgmSaveQueue;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 30;

  const { data, error } = await supabase
    .from('user_settings')
    .select('bgm_volume')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const { data: created, error: createError } = await supabase
      .from('user_settings')
      .insert({ user_id: user.id })
      .select('bgm_volume')
      .single();

    if (createError) throw createError;
    return Math.min(100, Math.max(0, Math.round(created.bgm_volume ?? 30)));
  }

  return Math.min(100, Math.max(0, Math.round(data.bgm_volume ?? 30)));
}

export function saveUserBgmVolume(value: number): Promise<void> {
  const normalized = Math.min(100, Math.max(0, Math.round(value)));
  bgmSaveQueue = bgmSaveQueue.catch(() => undefined).then(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          bgm_volume: normalized,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

    if (error) throw error;
  });
  return bgmSaveQueue;
}