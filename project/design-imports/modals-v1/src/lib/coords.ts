export function parseCoords(input: string): { x: number; y: number; z: number } | null {
  if (!input) return null;
  const trimmed = input.trim().replace(/,/g, ' ');
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 3) return null;
  
  const x = Number(parts[0]);
  const y = Number(parts[1]);
  const z = Number(parts[2]);
  
  if (isNaN(x) || isNaN(y) || isNaN(z)) return null;
  return { x: Math.round(x), y: Math.round(y), z: Math.round(z) };
}

export function formatCoords(coords: { x: number; y: number; z: number }): string {
  return `${coords.x} ${coords.y} ${coords.z}`;
}
