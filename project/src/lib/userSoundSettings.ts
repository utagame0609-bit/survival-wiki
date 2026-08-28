import { supabase } from './supabase';

export type UserSoundSettings = {
  bgmVolume: number;
  seVolume: number;
  seReverb: number;
};

const DEFAULT_SETTINGS: UserSoundSettings = {
  bgmVolume: 30,
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
    .select('bgm_volume, se_volume, se_reverb')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const { data: created, error: createError } = await supabase
      .from('user_settings')
      .insert({ user_id: user.id })
      .select('bgm_volume, se_volume, se_reverb')
      .single();

    if (createError) throw createError;

    return {
      bgmVolume: created.bgm_volume,
      seVolume: created.se_volume,
      seReverb: created.se_reverb,
    };
  }

  return {
    bgmVolume: data.bgm_volume,
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
        bgm_volume: Math.min(100, Math.max(0, Math.round(settings.bgmVolume))),
        se_volume: Math.min(100, Math.max(0, Math.round(settings.seVolume))),
        se_reverb: Math.min(100, Math.max(0, Math.round(settings.seReverb))),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  if (error) throw error;
}
