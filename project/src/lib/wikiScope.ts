import type { LocationWithPhotos } from './types';

export type WikiScopeType = 'month' | 'year' | 'world';
export type WikiCoverageMode = 'full' | 'digest';

export const WIKI_ARTICLE_CHAR_LIMIT = 3000;

export type WikiScopeResolution = {
  type: WikiScopeType;
  key: string;
  label: string;
  mode: WikiCoverageMode;
  description: string;
  locations: LocationWithPhotos[];
  estimatedCoverageChars: number;
};

export type WikiAvailablePeriods = {
  months: string[];
  years: string[];
};

const SCOPE_DESCRIPTIONS: Record<WikiScopeType, string> = {
  month: 'その月の出来事をできるだけ拾い、細かく振り返ります。',
  year: '一年の流れをまとめ、記録量に応じて詳細編纂とダイジェストを自動調整します。',
  world: 'このワールド全体の歩みから転機を選び、ひとつの世界史としてまとめます。',
};

function recordDate(location: LocationWithPhotos) {
  return location.created_at.split('T')[0] ?? '';
}

export function getWikiAvailablePeriods(locations: LocationWithPhotos[]): WikiAvailablePeriods {
  const dates = locations.map(recordDate).filter(Boolean);
  const months = Array.from(new Set(dates.map((date) => date.slice(0, 7))))
    .filter((value) => /^\d{4}-\d{2}$/.test(value))
    .sort((a, b) => b.localeCompare(a));
  const years = Array.from(new Set(dates.map((date) => date.slice(0, 4))))
    .filter((value) => /^\d{4}$/.test(value))
    .sort((a, b) => b.localeCompare(a));
  return { months, years };
}

export function formatWikiScopeLabel(type: WikiScopeType, key: string) {
  if (type === 'world') return 'ワールド全体';
  if (type === 'year') return /^\d{4}$/.test(key) ? `${key}年` : '対象年なし';
  if (!/^\d{4}-\d{2}$/.test(key)) return '対象月なし';
  const [year, month] = key.split('-');
  return `${year}年${Number(month)}月`;
}

export function filterWikiLocations(
  locations: LocationWithPhotos[],
  type: WikiScopeType,
  key: string,
) {
  if (type === 'world') return locations;
  if (!key) return [];
  if (type === 'year') {
    return locations.filter((location) => recordDate(location).startsWith(`${key}-`));
  }
  return locations.filter((location) => recordDate(location).startsWith(`${key}-`));
}

function estimateRecordCoverageChars(location: LocationWithPhotos) {
  const memoLength = location.detail_memo?.trim().length ?? 0;
  const nameWeight = Math.min(location.name.length, 36);
  const memoWeight = Math.min(Math.round(memoLength * 0.45), 180);
  const memberWeight = Math.min(location.members.length * 12, 48);
  const coordinateWeight = location.has_coordinates ? 18 : 0;
  const photoWeight = location.photos.some((photo) => photo.is_main) ? 18 : 0;
  return 64 + nameWeight + memoWeight + memberWeight + coordinateWeight + photoWeight;
}

export function estimateWikiCoverageChars(locations: LocationWithPhotos[]) {
  const framingAllowance = 420;
  return framingAllowance + locations.reduce((sum, location) => sum + estimateRecordCoverageChars(location), 0);
}

export function decideWikiCoverageMode(
  type: WikiScopeType,
  locations: LocationWithPhotos[],
): WikiCoverageMode {
  if (type === 'world') return 'digest';
  return estimateWikiCoverageChars(locations) <= WIKI_ARTICLE_CHAR_LIMIT ? 'full' : 'digest';
}

export function resolveWikiScope(
  locations: LocationWithPhotos[],
  type: WikiScopeType,
  key: string,
): WikiScopeResolution {
  const normalizedKey = type === 'world' ? 'all' : key;
  const scopedLocations = filterWikiLocations(locations, type, normalizedKey);
  return {
    type,
    key: normalizedKey,
    label: formatWikiScopeLabel(type, normalizedKey),
    mode: decideWikiCoverageMode(type, scopedLocations),
    description: SCOPE_DESCRIPTIONS[type],
    locations: scopedLocations,
    estimatedCoverageChars: estimateWikiCoverageChars(scopedLocations),
  };
}
