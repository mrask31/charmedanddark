import type { ProductInput, NarrativeBundle, GenerationContext } from './types';
import { getToneModifiers } from './tone-controller';
import {
  generateShortDescription,
  generateLongRitualDescription,
  generateRitualIntentionPrompt,
  generateCareUseNote,
  generateAltText,
  generateOneLineDropTagline,
} from './templates/generator';

export function generateNarrative(input: ProductInput): NarrativeBundle {
  const context: GenerationContext = {
    input,
    tone_modifiers: getToneModifiers(input.energy_tone),
  };
  
  const bundle: NarrativeBundle = {
    short_description: generateShortDescription(input),
    long_ritual_description: generateLongRitualDescription(input),
    ritual_intention_prompt: generateRitualIntentionPrompt(input),
    care_use_note: generateCareUseNote(input),
    alt_text: generateAltText(input),
    one_line_drop_tagline: generateOneLineDropTagline(input),
  };
  
  return bundle;
}
