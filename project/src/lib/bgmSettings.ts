export type BgmChannelKey = 'lead' | 'harmony' | 'bass' | 'drums';

export type BgmChannelSettings = Record<BgmChannelKey, boolean>;

const BGM_CHANNEL_SETTINGS_KEY = 'survival-wiki-bgm-channels';

const DEFAULT_BGM_CHANNEL_SETTINGS: BgmChannelSettings = {
  lead: true,
  harmony: true,
  bass: true,
  drums: true,
};

let channelSettings: BgmChannelSettings = { ...DEFAULT_BGM_CHANNEL_SETTINGS };
const listeners = new Set<(settings: BgmChannelSettings) => void>();

function normalizeSettings(value: unknown): BgmChannelSettings {
  if (!value || typeof value !== 'object') return { ...DEFAULT_BGM_CHANNEL_SETTINGS };
  const source = value as Partial<Record<BgmChannelKey, unknown>>;
  return {
    lead: source.lead !== false,
    harmony: source.harmony !== false,
    bass: source.bass !== false,
    drums: source.drums !== false,
  };
}

function readStoredSettings(): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = window.localStorage.getItem(BGM_CHANNEL_SETTINGS_KEY);
    if (!stored) return;
    channelSettings = normalizeSettings(JSON.parse(stored));
  } catch {
    channelSettings = { ...DEFAULT_BGM_CHANNEL_SETTINGS };
  }
}

function notify(): void {
  const snapshot = { ...channelSettings };
  listeners.forEach((listener) => listener(snapshot));
}

readStoredSettings();

export function getBgmChannelSettings(): BgmChannelSettings {
  return { ...channelSettings };
}

export function setBgmChannelEnabled(channel: BgmChannelKey, enabled: boolean): BgmChannelSettings {
  channelSettings = { ...channelSettings, [channel]: enabled };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(BGM_CHANNEL_SETTINGS_KEY, JSON.stringify(channelSettings));
  }
  notify();
  return getBgmChannelSettings();
}

export function setBgmChannelSettings(settings: BgmChannelSettings): BgmChannelSettings {
  channelSettings = normalizeSettings(settings);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(BGM_CHANNEL_SETTINGS_KEY, JSON.stringify(channelSettings));
  }
  notify();
  return getBgmChannelSettings();
}

export function subscribeToBgmChannelSettings(listener: (settings: BgmChannelSettings) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
