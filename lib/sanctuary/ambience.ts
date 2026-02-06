/**
 * Sanctuary Ambience System v1.0
 * 
 * Implements time-based ambient states per SANCTUARY_AMBIENCE.md specification.
 * 
 * RULES:
 * - Ambience responds ONLY to time of day
 * - NO user input, behavior, or presence tracking
 * - NO randomness or personalization
 * - Deterministic and server-safe
 * 
 * This module must never be expanded to include user interpretation.
 */

export type AmbienceState = 'dawn' | 'day' | 'dusk' | 'night';

export interface AmbienceConfig {
  state: AmbienceState;
  transitionProgress: number; // 0-1, for smooth transitions between states
  isTransitioning: boolean;
}

/**
 * Time boundaries for ambient states (24-hour format)
 */
const STATE_BOUNDARIES = {
  dawn: { start: 5, end: 8 },
  day: { start: 8, end: 17 },
  dusk: { start: 17, end: 21 },
  night: { start: 21, end: 5 } // wraps midnight
} as const;

/**
 * Transition windows (30 minutes before state change)
 */
const TRANSITION_DURATION_MINUTES = 30;

/**
 * Gets the current ambient state based on local time.
 * Deterministic - same time always produces same state.
 */
export function getCurrentAmbienceState(now: Date = new Date()): AmbienceConfig {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInHours = hours + minutes / 60;

  // Check for transitions (30 min before boundary)
  const transitions = [
    { from: 'night', to: 'dawn', boundary: 5, start: 4.5 },
    { from: 'dawn', to: 'day', boundary: 8, start: 7.5 },
    { from: 'day', to: 'dusk', boundary: 17, start: 16.5 },
    { from: 'dusk', to: 'night', boundary: 21, start: 20.5 }
  ];

  for (const transition of transitions) {
    if (timeInHours >= transition.start && timeInHours < transition.boundary) {
      const progress = (timeInHours - transition.start) / 0.5; // 0.5 hours = 30 min
      return {
        state: transition.from as AmbienceState,
        transitionProgress: progress,
        isTransitioning: true
      };
    }
  }

  // Determine current state (no transition)
  let state: AmbienceState;
  if (timeInHours >= 5 && timeInHours < 8) {
    state = 'dawn';
  } else if (timeInHours >= 8 && timeInHours < 17) {
    state = 'day';
  } else if (timeInHours >= 17 && timeInHours < 21) {
    state = 'dusk';
  } else {
    state = 'night';
  }

  return {
    state,
    transitionProgress: 0,
    isTransitioning: false
  };
}

/**
 * Gets CSS class name for current ambience state.
 * Used to apply state-specific styling via CSS variables.
 */
export function getAmbienceClassName(config: AmbienceConfig): string {
  return `sanctuary-ambience-${config.state}`;
}

/**
 * Server-safe: returns default ambience state for SSR.
 * Defaults to 'day' for neutral, accessible rendering.
 */
export function getServerSafeAmbience(): AmbienceConfig {
  return {
    state: 'day',
    transitionProgress: 0,
    isTransitioning: false
  };
}
