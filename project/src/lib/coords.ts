export type Coords = { x: number; y: number; z: number };

export function parseCoords(input: string): Coords | null {
  if (!input) return null;
  const parts = input
    .trim()
    .split(/[\s,;|/]+/)
    .filter((p) => p.length > 0)
    .map((p) => p.replace(/[()]/g, ''));

  if (parts.length < 3) return null;

  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => Number.isNaN(n))) return null;

  return { x: nums[0], y: nums[1], z: nums[2] };
}

export function formatCoords(c: Coords): string {
  return `${c.x} ${c.y} ${c.z}`;
}

export function formatCoordsShort(c: Coords): string {
  return `${c.x}, ${c.y}, ${c.z}`;
}
