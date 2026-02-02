import type { NarrativeBundle, EnergyTone, ToneModifiers } from './types';

// Tone-specific verb replacements
const TONE_VERBS: Record<EnergyTone, { from: string[]; to: string[] }> = {
  soft_whispered: {
    from: ['command', 'claim', 'wield', 'possess', 'guard', 'shield', 'ward', 'defend'],
    to: ['rest', 'hold', 'whisper', 'keep', 'settle', 'cradle', 'nestle', 'shelter'],
  },
  balanced_reverent: {
    from: ['command', 'claim', 'wield', 'possess'],
    to: ['carry', 'honor', 'keep', 'hold'],
  },
  dark_commanding: {
    from: ['rest', 'hold', 'whisper', 'keep', 'settle', 'cradle', 'nestle'],
    to: ['command', 'claim', 'bind', 'forge', 'wield', 'possess', 'channel'],
  },
};

export function getToneModifiers(tone: EnergyTone): ToneModifiers {
  switch (tone) {
    case 'soft_whispered':
      return {
        intensity: 'gentle',
        sentence_length: 'short',
        mysticism_level: 'grounded',
      };
    case 'balanced_reverent':
      return {
        intensity: 'moderate',
        sentence_length: 'medium',
        mysticism_level: 'balanced',
      };
    case 'dark_commanding':
      return {
        intensity: 'strong',
        sentence_length: 'varied',
        mysticism_level: 'elevated',
      };
  }
}

function replaceVerbs(text: string, tone: EnergyTone): string {
  const verbMap = TONE_VERBS[tone];
  let result = text;
  
  for (let i = 0; i < verbMap.from.length; i++) {
    const fromVerb = verbMap.from[i];
    const toVerb = verbMap.to[i % verbMap.to.length];
    
    // Replace with word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${fromVerb}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      // Preserve capitalization
      if (match[0] === match[0].toUpperCase()) {
        return toVerb.charAt(0).toUpperCase() + toVerb.slice(1);
      }
      return toVerb;
    });
    
    // Also handle verb forms (e.g., "commands" -> "carries")
    const verbFormRegex = new RegExp(`\\b${fromVerb}s\\b`, 'gi');
    result = result.replace(verbFormRegex, (match) => {
      if (match[0] === match[0].toUpperCase()) {
        return toVerb.charAt(0).toUpperCase() + toVerb.slice(1) + 's';
      }
      return toVerb + 's';
    });
  }
  
  return result;
}

function adjustSentenceStructure(text: string, tone: EnergyTone): string {
  if (tone === 'soft_whispered') {
    // Split longer sentences at commas for shorter, gentler pacing
    return text.replace(/,\s+/g, '. ').replace(/\.\s+\./g, '.');
  }
  
  if (tone === 'dark_commanding') {
    // Combine some shorter sentences for more declarative flow
    return text.replace(/\.\s+It\s+/g, ', it ').replace(/\.\s+The\s+/g, ', the ');
  }
  
  return text;
}

export function applyToneControl(bundle: NarrativeBundle, tone: EnergyTone): NarrativeBundle {
  const adjusted: NarrativeBundle = {
    short_description: '',
    long_ritual_description: '',
    ritual_intention_prompt: '',
    care_use_note: '',
    alt_text: '',
    one_line_drop_tagline: '',
  };
  
  // Apply verb replacements and sentence structure adjustments to each section
  for (const [key, value] of Object.entries(bundle) as Array<[keyof NarrativeBundle, string]>) {
    let text = value;
    
    // Apply verb replacements
    text = replaceVerbs(text, tone);
    
    // Apply sentence structure adjustments (except for alt_text which should stay descriptive)
    if (key !== 'alt_text') {
      text = adjustSentenceStructure(text, tone);
    }
    
    adjusted[key] = text;
  }
  
  return adjusted;
}
