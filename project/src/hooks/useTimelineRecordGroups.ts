import { useMemo } from 'react';
import type { LocationWithPhotos } from '@/lib/types';
import type { TimelineSortOrder } from '@/lib/userTimelineSettings';

export type { TimelineSortOrder } from '@/lib/userTimelineSettings';

export type TimelineDayGroup = {
  date: string;
  dayNumber: number;
  items: LocationWithPhotos[];
};

export function useTimelineRecordGroups({
  locations,
  searchQuery,
  sortOrder,
  selectedYear,
  selectedMonth,
}: {
  locations: LocationWithPhotos[];
  searchQuery: string;
  sortOrder: TimelineSortOrder;
  selectedYear: string;
  selectedMonth: string;
}) {
  const totalPhotos = useMemo(
    () => locations.reduce((sum, location) => sum + location.photos.length, 0),
    [locations],
  );

  const chronologicalDates = useMemo(
    () => Array.from(new Set(locations.map((location) => location.created_at.split('T')[0]))).sort((a, b) => a.localeCompare(b)),
    [locations],
  );

  const dayNumberByDate = useMemo(
    () => new Map(chronologicalDates.map((date, index) => [date, index + 1])),
    [chronologicalDates],
  );

  const availableYears = useMemo(
    () => Array.from(new Set(chronologicalDates.map((date) => date.slice(0, 4)))).sort((a, b) => b.localeCompare(a)),
    [chronologicalDates],
  );

  const availableMonths = useMemo(() => {
    if (!selectedYear) return [];
    return Array.from(
      new Set(
        chronologicalDates
          .filter((date) => date.startsWith(`${selectedYear}-`))
          .map((date) => date.slice(5, 7)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [chronologicalDates, selectedYear]);

  const groupedByDay = useMemo<TimelineDayGroup[]>(() => {
    const normalized = searchQuery.trim().toLocaleLowerCase();
    const filtered = locations
      .filter((location) => {
        const date = location.created_at.split('T')[0];
        if (selectedYear && !date.startsWith(`${selectedYear}-`)) return false;
        if (selectedYear && selectedMonth && date.slice(5, 7) !== selectedMonth) return false;

        if (!normalized) return true;
        const memberNames = location.members
          .map((member) => member.name)
          .join(' ')
          .toLocaleLowerCase();
        return (
          location.name.toLocaleLowerCase().includes(normalized) ||
          location.detail_memo?.toLocaleLowerCase().includes(normalized) ||
          memberNames.includes(normalized)
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

    return dates.map((date) => ({
      date,
      dayNumber: dayNumberByDate.get(date) ?? 1,
      items: byDate.get(date) ?? [],
    }));
  }, [dayNumberByDate, locations, searchQuery, selectedMonth, selectedYear, sortOrder]);

  return { totalPhotos, groupedByDay, availableYears, availableMonths };
}
