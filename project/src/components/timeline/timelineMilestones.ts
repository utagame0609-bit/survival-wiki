import { useCallback } from 'react';

export function getMilestoneStorageKey(worldId: string) {
  return `survival-wiki:milestones:${worldId}`;
}

export function loadUnlockedMilestones(worldId: string): number[] {
  try {
    const stored = localStorage.getItem(getMilestoneStorageKey(worldId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveUnlockedMilestones(worldId: string, milestones: number[]) {
  try {
    localStorage.setItem(getMilestoneStorageKey(worldId), JSON.stringify(milestones));
  } catch {
    // localStorage may be unavailable; milestone state remains in memory.
  }
}
