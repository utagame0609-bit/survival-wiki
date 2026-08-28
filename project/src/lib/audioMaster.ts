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
 * Smooth user-facing volume curve.
 *
 * The curve is designed to keep 0% and 100% unchanged while making the
 * middle-to-high range feel more gradual than a linear amplitude slider.
 * Input and output are normalized to 0..1.
 */
export function applyVolumeCurve(value: number): number {
  const normalized = Math.min(1, Math.max(0, value));
  return normalized * normalized * (3 - 2 * normalized);
}
