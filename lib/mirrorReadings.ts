/**
 * Mirror Readings Data Module
 * 
 * The Mirror is a single-response reflection ritual.
 * One input → one response. No chat. No conversation.
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
  // OVERWHELMED
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
    productSlug: 'ritual-sage-bundle',
    ritualSuggestion: 'Clear the air. Begin again.'
  },

  // TIRED
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
    productSlug: 'signature-pullover-hoodie',
    ritualSuggestion: 'Wear something soft. Close your eyes. Stay still.'
  },

  // UNSEEN
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
    productSlug: 'crest-logo-tshirt',
    ritualSuggestion: 'Wear something that marks you. Even if only you know.'
  },

  // RESTLESS
  {
    id: 'restless-01',
    state: 'restless',
    validation: 'The unease is not a flaw.',
    reflection: 'Something in you is trying to move. Let it surface before you act.',
    productSlug: 'three-star-candle',
    ritualSuggestion: 'Set three intentions. Write them down. Burn nothing yet.'
  },
  {
    id: 'restless-02',
    state: 'restless',
    validation: 'Stillness is not the answer. Neither is motion.',
    reflection: 'You are between states. That is where change begins.',
    productSlug: 'black-ceramic-vase',
    ritualSuggestion: 'Place one thing where it belongs. Start there.'
  },

  // HEAVY
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
    productSlug: 'obsidian-trinket-dish',
    ritualSuggestion: 'Put down what you are holding. Even for a moment.'
  },

  // DISTANT
  {
    id: 'distant-01',
    state: 'distant',
    validation: 'Disconnection is not permanent.',
    reflection: 'You are not lost. You are somewhere else. That is allowed.',
    productSlug: 'black-gold-stars-wall-art',
    ritualSuggestion: 'Look at something far away. Let your eyes rest there.'
  },
  {
    id: 'distant-02',
    state: 'distant',
    validation: 'Numbness is protection.',
    reflection: 'When feeling returns, it will. Until then, you are safe here.',
    productSlug: 'zip-up-hoodie',
    ritualSuggestion: 'Cover yourself. Stay warm. Wait.'
  },

  // QUIET
  {
    id: 'quiet-01',
    state: 'quiet',
    validation: 'Silence is not emptiness.',
    reflection: 'You are not absent. You are listening.',
    productSlug: 'ritual-charcuterie-board',
    ritualSuggestion: 'Prepare something simple. Arrange it with care.'
  },
  {
    id: 'quiet-02',
    state: 'quiet',
    validation: 'This is not loneliness.',
    reflection: 'Some moments are meant to be held alone. This is one of them.',
    productSlug: 'black-beanie',
    ritualSuggestion: 'Go outside. Say nothing. Return when ready.'
  },

  // UNCERTAIN
  {
    id: 'uncertain-01',
    state: 'uncertain',
    validation: 'Not knowing is not failing.',
    reflection: 'Clarity will come. Or it will not. Either way, you will move forward.',
    productSlug: 'red-heart-vase',
    ritualSuggestion: 'Place something living where you can see it. Watch it change.'
  },
  {
    id: 'uncertain-02',
    state: 'uncertain',
    validation: 'The path does not need to be clear yet.',
    reflection: 'You are allowed to wait. You are allowed to not decide.',
    productSlug: 'two-tier-display-tray',
    ritualSuggestion: 'Organize one small thing. Let that be enough.'
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
