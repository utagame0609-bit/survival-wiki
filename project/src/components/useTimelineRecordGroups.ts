import { useMemo } from 'react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';

export type TimelineSortOrder = 'newest' | 'oldest';

export type TimelineDayGroup = {
  date: string;
  dayNumber: number;
  items: LocationWithPhotos[];
};

export function useTimelineRecordGroups({
  locations,
  members,
  searchQuery,
  sortOrder,
}: {
  locations: LocationWithPhotos[];
  members: WorldWithMembers['members'];
  searchQuery: string;
  sortOrder: TimelineSortOrder;
}) {
  const totalPhotos = useMemo(
    () => locations.reduce((sum, location) => sum + location.photos.length, 0),
    [locations],
  );

  const groupedByDay = useMemo<TimelineDayGroup[]>(() => {
    const normalized = searchQuery.trim().toLocaleLowerCase();
    const filtered = locations
      .filter((location) => {
        if (!normalized) return true;
        const memberNames = (location.member_ids ?? [])
          .map((id) => members.find((member) => member.id === id)?.name ?? '')
          .join(' ')
          .toLocaleLowerCase();
        return (
          location.name.toLocaleLowerCase().includes(normalized) ||
          location.detail_memo?.toLocaleLowerCase().includes(normalized) ||
          memberNames.includes(normalized) ||
          (location.tags ?? []).some((tag) => tag.toLocaleLowerCase().includes(normalized))
        );
      })
      .sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
      });

    const byDate = new Map<string, LocationWithPhotos[]>();
    filtered.forEach((location) => {
      const key = location.created_at.split('T')[0];
      const group = byDate.get(key) ?? [];
      group.push(location);
      byDate.set(key, group);
    });

    const dates = Array.from(byDate.keys()).sort((a, b) =>
      sortOrder === 'oldest' ? a.localeCompare(b) : b.localeCompare(a),
    );

    return dates.map((date, index) => ({
      date,
      dayNumber: index + 1,
      items: byDate.get(date) ?? [],
    }));
  }, [locations, members, searchQuery, sortOrder]);

  return { totalPhotos, groupedByDay };
}
