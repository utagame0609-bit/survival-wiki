/**
 * Shared internal output levels.
 *
 * Keep the common BGM/SE master output as the baseline. Category-specific gains
 * are applied only at their own source paths so BGM, SE, and NPC BGM can be
 * tuned independently without changing the user-facing sliders or reverb.
 */
export const MASTER_OUTPUT_GAIN = 1.8;
export const SE_OUTPUT_GAIN = 1.5;
export const NPC_BGM_OUTPUT_GAIN = 1.5;
