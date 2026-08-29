export const WORLD_PRESET_AVATARS = {
  playerUta: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%231e293b"/><circle cx="64" cy="50" r="32" fill="%23fde047"/><rect x="42" y="30" width="44" height="20" fill="%231e1b4b"/><rect x="46" y="48" width="8" height="8" fill="%230f172a"/><rect x="74" y="48" width="8" height="8" fill="%230f172a"/><rect x="58" y="64" width="12" height="4" fill="%23e11d48"/><path d="M 28 118 C 28 88, 100 88, 100 118 Z" fill="%233b82f6"/></svg>',
  memberGolem: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%231e293b"/><rect x="36" y="24" width="56" height="60" fill="%23e2e8f0"/><rect x="44" y="42" width="10" height="10" fill="%23ef4444"/><rect x="74" y="42" width="10" height="10" fill="%23ef4444"/><rect x="58" y="58" width="12" height="18" fill="%2394a3b8"/><path d="M 20 118 C 20 84, 108 84, 108 118 Z" fill="%23cbd5e1"/></svg>',
  memberAllay: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%230f172a"/><circle cx="64" cy="54" r="26" fill="%2338bdf8"/><circle cx="56" cy="52" r="4" fill="%23ffffff"/><circle cx="72" cy="52" r="4" fill="%23ffffff"/><ellipse cx="36" cy="62" rx="16" ry="8" fill="%23bae6fd" opacity="0.8"/><ellipse cx="92" cy="62" rx="16" ry="8" fill="%23bae6fd" opacity="0.8"/><path d="M 46 80 Q 64 114 82 80 Z" fill="%230284c7"/></svg>',
} as const;

export const WORLD_PRESET_AVATAR_LIST = [
  { key: 'playerUta', src: WORLD_PRESET_AVATARS.playerUta, alt: 'Uta' },
  { key: 'memberGolem', src: WORLD_PRESET_AVATARS.memberGolem, alt: 'Golem' },
  { key: 'memberAllay', src: WORLD_PRESET_AVATARS.memberAllay, alt: 'Allay' },
] as const;
