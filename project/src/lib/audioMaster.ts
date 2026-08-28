/**
 * Shared category output levels.
 *
 * These values are intentionally separate so BGM, SE, and NPC BGM can be
 * tuned independently without changing the user-facing volume sliders or reverb.
 */
export const BGM_OUTPUT_GAIN = 0.5;
export const SE_OUTPUT_GAIN = 1.6;
export const NPC_BGM_OUTPUT_GAIN = 2.0;

/**
 * Human-perceived volume curve for user-facing BGM/SE sliders.
 * 0% stays silent and 100% stays at full gain.
 */
export function applyVolumeCurve(percent: number): number {
  const normalized = Math.min(100, Math.max(0, percent)) / 100;
  return normalized * normalized;
}
