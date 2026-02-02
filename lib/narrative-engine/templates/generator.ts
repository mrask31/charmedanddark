import type { ProductInput } from '../types';
import { SYMBOL_PHRASES, EMOTIONAL_CORE_THEMES, ITEM_TYPE_CONTEXT } from './index';

export function generateShortDescription(input: ProductInput): string {
  const symbol = SYMBOL_PHRASES[input.primary_symbol];
  const theme = EMOTIONAL_CORE_THEMES[input.emotional_core];
  const context = ITEM_TYPE_CONTEXT[input.item_type];
  
  const descriptor = symbol.descriptors[0];
  const quality = theme.qualities[0];
  const verb = theme.verbs[0];
  
  let description = `${input.item_name} is a ${descriptor} ${input.item_type} that ${context.presence[0]} the ${input.primary_symbol}. `;
  description += `It ${context.presence[1]} ${quality} ${theme.nouns[0]}. `;
  
  if (input.drop_name) {
    description += `Part of the ${input.drop_name} collection.`;
  } else if (input.limited === 'numbered') {
    description += `A numbered piece.`;
  } else if (input.intended_use) {
    const useContext = input.intended_use === 'worn_daily' ? 'daily wear' :
                       input.intended_use === 'worn_intentionally' ? 'intentional moments' :
                       input.intended_use === 'displayed' ? 'quiet display' : 'thoughtful gifting';
    description += `Made for ${useContext}.`;
  }
  
  return description.trim();
}

export function generateLongRitualDescription(input: ProductInput): string {
  const symbol = SYMBOL_PHRASES[input.primary_symbol];
  const theme = EMOTIONAL_CORE_THEMES[input.emotional_core];
  const context = ITEM_TYPE_CONTEXT[input.item_type];
  
  const paragraphs: string[] = [];
  
  // Opening: Establish presence and symbolism
  paragraphs.push(
    `${input.item_name} ${context.presence[0]} as a ${symbol.descriptors[0]} embodiment of ${input.primary_symbol} and ${input.emotional_core}. ` +
    `The ${symbol.imagery[0]} ${context.presence[1]} ${symbol.descriptors[1]}, ${symbol.descriptors[2]}, a ${theme.qualities[0]} presence.`
  );
  
  // Middle: Explore emotional core and ritual meaning
  paragraphs.push(
    `This ${input.item_type} ${theme.verbs[0]}s ${theme.nouns[0]} through its ${symbol.descriptors[3]} form. ` +
    `${symbol.imagery[1]} and ${symbol.imagery[2]} meet in ${theme.qualities[1]} ${theme.nouns[1]}, ` +
    `a ${theme.qualities[2]} ${theme.nouns[2]} that ${theme.verbs[1]}s without demand.`
  );
  
  // Closing: Relationship between object and owner
  paragraphs.push(
    `To ${context.wearing[0]} this piece is to ${theme.verbs[2]} ${theme.nouns[3]}. ` +
    `It ${context.presence[2]}s ${theme.qualities[3]}, ${theme.qualities[4]}, ` +
    `a ${symbol.descriptors[4]} ${theme.nouns[4]} that ${theme.verbs[3]}s its ${theme.qualities[5]} nature.`
  );
  
  return paragraphs.join('\n\n');
}

export function generateRitualIntentionPrompt(input: ProductInput): string {
  const theme = EMOTIONAL_CORE_THEMES[input.emotional_core];
  const context = ITEM_TYPE_CONTEXT[input.item_type];
  
  return `What ${theme.nouns[0]} will you ${theme.verbs[0]} when you ${context.wearing[0]} this. ` +
         `What ${theme.nouns[1]} will it ${theme.verbs[1]}.`;
}

export function generateCareUseNote(input: ProductInput): string {
  const theme = EMOTIONAL_CORE_THEMES[input.emotional_core];
  const context = ITEM_TYPE_CONTEXT[input.item_type];
  
  return `${theme.verbs[4]} this ${input.item_type} with ${theme.qualities[0]} ${theme.nouns[5]}. ` +
         `It ${theme.verbs[5]}s ${theme.qualities[1]} attention, ${theme.qualities[2]} care. ` +
         `${theme.verbs[0]} it as it ${theme.verbs[0]}s you.`;
}

export function generateAltText(input: ProductInput): string {
  const symbol = SYMBOL_PHRASES[input.primary_symbol];
  
  return `${input.item_type} featuring ${input.primary_symbol} symbol, ${symbol.descriptors[0]} and ${symbol.descriptors[1]}, with ${symbol.imagery[0]} detail`;
}

export function generateOneLineDropTagline(input: ProductInput): string {
  const theme = EMOTIONAL_CORE_THEMES[input.emotional_core];
  const symbol = SYMBOL_PHRASES[input.primary_symbol];
  
  if (!input.drop_name) {
    return '';
  }
  
  return `${input.drop_name}: ${theme.qualities[0]} ${input.emotional_core}, ${symbol.descriptors[0]} ${input.primary_symbol}.`;
}
