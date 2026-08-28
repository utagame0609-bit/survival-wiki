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
 * User-facing volume curve.
 * Input/output are both normalized 0..1 values.
 *
 * The 0% and 50% positions keep the current linear gain,
 * while the upper half gains a little more operating range.
 * 100% remains full gain.
 */
export function applyVolumeCurve(normalized: number): number {
  const x = Math.min(1, Math.max(0, normalized));
  if (x <= 0.5) return x;
  const upper = x * (1 - x) * (2 * x - 1);
  return Math.min(1, x + upper * 0.75);
}
