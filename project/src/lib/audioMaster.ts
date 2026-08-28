/**
 * Shared category output levels.
 *
 * These values are intentionally separate so BGM, SE, and NPC BGM can be
 * tuned independently without changing the user-facing volume sliders or reverb.
 */
export const BGM_OUTPUT_GAIN = 0.3;
export const SE_OUTPUT_GAIN = 1.6;
export const NPC_BGM_OUTPUT_GAIN = 2.0;

/**
 * Smooth user-facing volume curve.
 *
 * Input and output are normalized to 0..1. A power curve keeps the slider
 * behavior consistent across the full range while giving finer control at
 * lower settings. The exponent is intentionally centralized for easy tuning.
 */
const VOLUME_CURVE_EXPONENT = 2;

export function applyVolumeCurve(value: number): number {
  const normalized = Math.min(1, Math.max(0, value));
  return Math.pow(normalized, VOLUME_CURVE_EXPONENT);
}
