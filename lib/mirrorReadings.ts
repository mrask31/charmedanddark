/**
 * Mirror Readings Data Module
 * 
 * The Mirror is a single-response reflection ritual.
 * One input → one response. No chat. No conversation.
 * 
 * PSYCHOLOGICAL MAPPING RULES:
 * - Overwhelmed → Containment (enclosed, finite, grounding)
 * - Tired → Warmth (literal warmth, no decisions, stillness)
 * - Unseen → Witness (static, present, "looks back")
 * - Restless → Boundary (limits, separation, interrupts pacing)
 * - Heavy → Grounding (literal weight, solid, anchored)
 * - Distant → Return (invites approach, suggests ritual, repeatable)
 * - Quiet → Amplification (minimal, refined, preserves silence)
 * - Uncertain → Orientation (timeless, neutral, archetypal)
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type EmotionalState =
  | 'overwhelmed'
  | 'tired'
  | 'unseen'
  | 'restless'
  | 'heavy'
  | 'distant'
  | 'quiet'
  | 'uncertain';

export interface MirrorReading {
  id: string;
  state: EmotionalState;
  validation: string;
  reflection: string;
  productSlug: string;
  ritualSuggestion: string;
}

// ============================================
// MIRROR READINGS DATA
// ============================================

export const mirrorReadings: MirrorReading[] = [
  // OVERWHELMED → CONTAINMENT
  // Eligible: Candles with heavy vessels, lidded containers, drinkware with weight
  {
    id: 'overwhelmed-01',
    state: 'overwhelmed',
    validation: 'The noise is real. You are not failing.',
    reflection: 'The world demands too much, too often. You are allowed to step back.',
    productSlug: 'midnight-ritual-candle',
    ritualSuggestion: 'Light something. Let the room soften around you.'
  },
  {
    id: 'overwhelmed-02',
    state: 'overwhelmed',
    validation: 'Nothing is wrong with you.',
    reflection: 'Sometimes the weight is not yours to carry. Set it down.',
    productSlug: 'obsidian-trinket-dish',
    ritualSuggestion: 'Place what you carry here. Even for a moment.'
  },

  // TIRED → WARMTH
  // Eligible: Candles, soft light, drinkware for heat
  {
    id: 'tired-01',
    state: 'tired',
    validation: 'Rest is not weakness.',
    reflection: 'You have been moving for too long. The body remembers what the mind forgets.',
    productSlug: 'black-ceramic-ritual-mug',
    ritualSuggestion: 'Make something warm. Sit with it. Do nothing else.'
  },
  {
    id: 'tired-02',
    state: 'tired',
    validation: 'Exhaustion is a message, not a failure.',
    reflection: 'The world will keep turning without you for a moment. Let it.',
    productSlug: 'three-star-candle',
    ritualSuggestion: 'Light this. Close your eyes. Stay still.'
  },

  // UNSEEN → WITNESS
  // Eligible: Wall objects, mirrors, figurative decor with quiet gaze
  {
    id: 'unseen-01',
    state: 'unseen',
    validation: 'You are here. That matters.',
    reflection: 'Visibility is not the same as worth. You exist beyond what others notice.',
    productSlug: 'reflection-tabletop-mirror',
    ritualSuggestion: 'Look at yourself. See what is there.'
  },
  {
    id: 'unseen-02',
    state: 'unseen',
    validation: 'The Mirror sees you.',
    reflection: 'Some things are meant to be quiet. That does not make them small.',
    productSlug: 'black-gold-stars-wall-art',
    ritualSuggestion: 'Hang this where you will see it. Let it see you back.'
  },

  // RESTLESS → BOUNDARY
  // Eligible: Trays, table objects, items that mark space
  {
    id: 'restless-01',
    state: 'restless',
    validation: 'The unease is not a flaw.',
    reflection: 'Something in you is trying to move. Let it surface before you act.',
    productSlug: 'two-tier-display-tray',
    ritualSuggestion: 'Place three things here. Define the edges. Stop there.'
  },
  {
    id: 'restless-02',
    state: 'restless',
    validation: 'Stillness is not the answer. Neither is motion.',
    reflection: 'You are between states. That is where change begins.',
    productSlug: 'ritual-charcuterie-board',
    ritualSuggestion: 'Mark a boundary. Place one thing inside it. Begin there.'
  },

  // HEAVY → GROUNDING
  // Eligible: Stone, resin, metal decor, heavy drinkware, anchored objects
  {
    id: 'heavy-01',
    state: 'heavy',
    validation: 'Grief has no timeline.',
    reflection: 'What you carry is real. It does not need to be explained or justified.',
    productSlug: 'skull-bookends',
    ritualSuggestion: 'Hold something with weight. Let it ground you.'
  },
  {
    id: 'heavy-02',
    state: 'heavy',
    validation: 'You do not have to be lighter.',
    reflection: 'Some days are meant to be heavy. This is one of them.',
    productSlug: 'black-ceramic-vase',
    ritualSuggestion: 'Fill this with water. Feel the weight. Set it down.'
  },

  // DISTANT → RETURN
  // Eligible: Candles, ritual tools, objects used repeatedly
  {
    id: 'distant-01',
    state: 'distant',
    validation: 'Disconnection is not permanent.',
    reflection: 'You are not lost. You are somewhere else. That is allowed.',
    productSlug: 'midnight-ritual-candle',
    ritualSuggestion: 'Light this when you are ready to return. Not before.'
  },
  {
    id: 'distant-02',
    state: 'distant',
    validation: 'Numbness is protection.',
    reflection: 'When feeling returns, it will. Until then, you are safe here.',
    productSlug: 'ritual-sage-bundle',
    ritualSuggestion: 'Burn this when you are ready. The smoke will call you back.'
  },

  // QUIET → AMPLIFICATION (SUBTLE)
  // Eligible: Minimal decor, matte surfaces, low contrast objects
  {
    id: 'quiet-01',
    state: 'quiet',
    validation: 'Silence is not emptiness.',
    reflection: 'You are not absent. You are listening.',
    productSlug: 'obsidian-trinket-dish',
    ritualSuggestion: 'Place one small thing here. Let it rest in the quiet.'
  },
  {
    id: 'quiet-02',
    state: 'quiet',
    validation: 'This is not loneliness.',
    reflection: 'Some moments are meant to be held alone. This is one of them.',
    productSlug: 'black-ceramic-vase',
    ritualSuggestion: 'Leave this empty. Let the space speak.'
  },

  // UNCERTAIN → ORIENTATION
  // Eligible: Core permanent items, simple forms, archetypal shapes
  {
    id: 'uncertain-01',
    state: 'uncertain',
    validation: 'Not knowing is not failing.',
    reflection: 'Clarity will come. Or it will not. Either way, you will move forward.',
    productSlug: 'three-star-candle',
    ritualSuggestion: 'Light this. Watch the flame. It knows where to go.'
  },
  {
    id: 'uncertain-02',
    state: 'uncertain',
    validation: 'The path does not need to be clear yet.',
    reflection: 'You are allowed to wait. You are allowed to not decide.',
    productSlug: 'reflection-tabletop-mirror',
    ritualSuggestion: 'Look into this. See what remains constant.'
  }
];

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Get a random reading for a specific emotional state
 */
export function getReadingForState(state: EmotionalState): MirrorReading {
  const matchingReadings = mirrorReadings.filter(r => r.state === state);
  
  if (matchingReadings.length === 0) {
    throw new Error(`No readings found for state: ${state}`);
  }
  
  const randomIndex = Math.floor(Math.random() * matchingReadings.length);
  return matchingReadings[randomIndex];
}

/**
 * Get human-readable label for emotional state
 */
export function getStateLabel(state: EmotionalState): string {
  const labels: Record<EmotionalState, string> = {
    overwhelmed: 'Overwhelmed',
    tired: 'Tired',
    unseen: 'Unseen',
    restless: 'Restless',
    heavy: 'Heavy',
    distant: 'Distant',
    quiet: 'Quiet',
    uncertain: 'Uncertain'
  };
  
  return labels[state];
}

/**
 * Get all available emotional states
 */
export function getAllStates(): EmotionalState[] {
  return [
    'overwhelmed',
    'tired',
    'unseen',
    'restless',
    'heavy',
    'distant',
    'quiet',
    'uncertain'
  ];
}

// ============================================
// FUTURE: SUPABASE PERSISTENCE (NOT IMPLEMENTED)
// ============================================

/**
 * Expected database schema for mirror_readings table:
 * 
 * CREATE TABLE mirror_readings (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   email TEXT NOT NULL REFERENCES sanctuary_signups(email),
 *   emotional_state TEXT NOT NULL,
 *   reading_id TEXT NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * CREATE INDEX idx_mirror_readings_email ON mirror_readings(email);
 * CREATE INDEX idx_mirror_readings_created_at ON mirror_readings(created_at DESC);
 */

// Stub for future implementation:
// export async function saveMirrorReading(
//   email: string,
//   state: EmotionalState,
//   readingId: string
// ): Promise<void> {
//   const supabase = getSupabaseClient();
//   
//   const { error } = await supabase
//     .from('mirror_readings')
//     .insert({
//       email,
//       emotional_state: state,
//       reading_id: readingId
//     });
//   
//   if (error) {
//     throw error;
//   }
// }
