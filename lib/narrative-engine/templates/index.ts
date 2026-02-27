import type { EmotionalCore, PrimarySymbol, ItemType } from '../types';

// Symbol-specific imagery and descriptive language
export const SYMBOL_PHRASES: Record<PrimarySymbol, {
  imagery: string[];
  descriptors: string[];
}> = {
  moon: {
    imagery: ['lunar', 'crescent', 'waxing', 'waning', 'celestial', 'night'],
    descriptors: ['silver', 'pale', 'quiet', 'watching', 'cyclical', 'distant'],
  },
  rose: {
    imagery: ['petal', 'thorn', 'bloom', 'stem', 'garden', 'bud'],
    descriptors: ['velvet', 'crimson', 'soft', 'sharp', 'layered', 'unfolding'],
  },
  heart: {
    imagery: ['chamber', 'pulse', 'beat', 'core', 'center', 'vessel'],
    descriptors: ['deep', 'steady', 'warm', 'enclosed', 'vital', 'tender'],
  },
  blade: {
    imagery: ['edge', 'point', 'steel', 'cut', 'line', 'boundary'],
    descriptors: ['sharp', 'clean', 'precise', 'cold', 'decisive', 'clear'],
  },
  bone: {
    imagery: ['marrow', 'structure', 'frame', 'remains', 'foundation', 'relic'],
    descriptors: ['white', 'bare', 'enduring', 'stark', 'essential', 'ancient'],
  },
  mirror: {
    imagery: ['reflection', 'surface', 'glass', 'image', 'double', 'gaze'],
    descriptors: ['clear', 'still', 'revealing', 'truthful', 'facing', 'silent'],
  },
  candle: {
    imagery: ['flame', 'wax', 'wick', 'light', 'glow', 'shadow'],
    descriptors: ['warm', 'flickering', 'steady', 'golden', 'burning', 'soft'],
  },
};

// Emotional core vocabulary and themes
export const EMOTIONAL_CORE_THEMES: Record<EmotionalCore, {
  verbs: string[];
  nouns: string[];
  qualities: string[];
}> = {
  devotion: {
    verbs: ['honor', 'keep', 'hold', 'carry', 'tend', 'preserve'],
    nouns: ['commitment', 'dedication', 'faithfulness', 'constancy', 'loyalty', 'care'],
    qualities: ['steadfast', 'unwavering', 'constant', 'true', 'faithful', 'devoted'],
  },
  grief: {
    verbs: ['remember', 'mourn', 'hold', 'carry', 'honor', 'bear'],
    nouns: ['loss', 'absence', 'memory', 'sorrow', 'weight', 'silence'],
    qualities: ['heavy', 'quiet', 'deep', 'tender', 'aching', 'gentle'],
  },
  protection: {
    verbs: ['guard', 'shield', 'ward', 'keep', 'defend', 'shelter'],
    nouns: ['safety', 'boundary', 'refuge', 'sanctuary', 'barrier', 'haven'],
    qualities: ['strong', 'vigilant', 'secure', 'watchful', 'firm', 'resolute'],
  },
  longing: {
    verbs: ['reach', 'seek', 'yearn', 'desire', 'wait', 'hope'],
    nouns: ['distance', 'absence', 'wanting', 'hunger', 'pull', 'ache'],
    qualities: ['distant', 'reaching', 'unfulfilled', 'patient', 'tender', 'persistent'],
  },
  transformation: {
    verbs: ['change', 'shift', 'become', 'shed', 'emerge', 'evolve'],
    nouns: ['passage', 'threshold', 'metamorphosis', 'transition', 'rebirth', 'renewal'],
    qualities: ['changing', 'fluid', 'liminal', 'emerging', 'unfolding', 'becoming'],
  },
  memory: {
    verbs: ['remember', 'recall', 'preserve', 'hold', 'keep', 'honor'],
    nouns: ['past', 'echo', 'trace', 'remnant', 'imprint', 'record'],
    qualities: ['fading', 'preserved', 'lingering', 'distant', 'cherished', 'held'],
  },
  power: {
    verbs: ['command', 'claim', 'wield', 'hold', 'possess', 'channel'],
    nouns: ['strength', 'force', 'authority', 'will', 'sovereignty', 'dominion'],
    qualities: ['strong', 'commanding', 'potent', 'sovereign', 'formidable', 'assured'],
  },
};

// Item type contextual phrases
export const ITEM_TYPE_CONTEXT: Record<ItemType, {
  wearing: string[];
  presence: string[];
}> = {
  jewelry: {
    wearing: ['wear', 'carry', 'adorn', 'hold close', 'keep near'],
    presence: ['rests against', 'circles', 'marks', 'adorn', 'grace'],
  },
  apparel: {
    wearing: ['wear', 'drape', 'wrap', 'carry', 'hold'],
    presence: ['covers', 'drapes', 'falls', 'wrap', 'envelop'],
  },
  home_object: {
    wearing: ['keep', 'place', 'hold', 'display', 'house'],
    presence: ['rests', 'sits', 'stands', 'occupy', 'inhabit'],
  },
  altar_piece: {
    wearing: ['place', 'keep', 'tend', 'honor', 'maintain'],
    presence: ['stands', 'rests', 'holds space', 'mark', 'anchor'],
  },
  wearable_symbol: {
    wearing: ['wear', 'carry', 'bear', 'display', 'hold'],
    presence: ['marks', 'signifies', 'declares', 'show', 'bear'],
  },
};
