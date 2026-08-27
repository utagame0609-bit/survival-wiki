import type { LocationWithPhotos } from '@/lib/types';

export type DayGroup = {
  dateKey: string;
  label: string;
  dayNumber: number;
  dateLabel: string;
  dayLabel: string;
  locations: LocationWithPhotos[];
  bgPhotoPath?: string;
};

export type Milestone = { day: number; label: string };

export const MILESTONES: Milestone[] = [
  { day: 3, label: '3日目、生存確認。' },
  { day: 7, label: 'まだ生きている。7日目。' },
  { day: 30, label: '奇跡が起きた。30日生存。' },
];

export function getMilestone(dayNumber: number) {
  return MILESTONES.find((milestone) => milestone.day === dayNumber);
}

export function groupByDay(locations: LocationWithPhotos[]): DayGroup[] {
  const sorted = [...locations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const map = new Map<string, LocationWithPhotos[]>();
  for (const loc of sorted) {
    const d = new Date(loc.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const arr = map.get(key) ?? [];
    arr.push(loc);
    map.set(key, arr);
  }
  const sortedKeysAsc = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
  const dateKeyToDayNum = new Map<string, number>();
  sortedKeysAsc.forEach((key, index) => dateKeyToDayNum.set(key, index + 1));
  const groups: DayGroup[] = [];
  for (const [key, locs] of map) {
    const d = new Date(key);
    const dateLabel = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    const dayLabel = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
    const dayNum = dateKeyToDayNum.get(key) ?? 1;
    const label = `${dayNum}日目`;
    const firstWithPhoto = [...locs]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .find((location) => location.photos.some((photo) => photo.is_main));
    const bgPhotoPath = firstWithPhoto?.photos.find((photo) => photo.is_main)?.storage_path;
    groups.push({
      dateKey: key,
      label,
      dayNumber: dayNum,
      dateLabel,
      dayLabel,
      locations: [...locs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      bgPhotoPath,
    });
  }
  return groups;
}
