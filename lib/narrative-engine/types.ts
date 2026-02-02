// Type definitions for Product Narrative Engine

export type ItemType = 
  | "jewelry" 
  | "apparel" 
  | "home_object" 
  | "altar_piece" 
  | "wearable_symbol";

export type PrimarySymbol = 
  | "moon" 
  | "rose" 
  | "heart" 
  | "blade" 
  | "bone" 
  | "mirror" 
  | "candle";

export type EmotionalCore = 
  | "devotion" 
  | "grief" 
  | "protection" 
  | "longing" 
  | "transformation" 
  | "memory" 
  | "power";

export type EnergyTone = 
  | "soft_whispered" 
  | "balanced_reverent" 
  | "dark_commanding";

export type LimitedType = "yes" | "no" | "numbered";

export type IntendedUse = 
  | "worn_daily" 
  | "worn_intentionally" 
  | "displayed" 
  | "gifted";

export interface ProductInput {
  // Required fields
  item_name: string;
  item_type: ItemType;
  primary_symbol: PrimarySymbol;
  emotional_core: EmotionalCore;
  energy_tone: EnergyTone;
  
  // Optional fields
  drop_name?: string;
  limited?: LimitedType;
  intended_use?: IntendedUse;
  avoid_list?: string[];
}

export interface NarrativeBundle {
  short_description: string;
  long_ritual_description: string;
  ritual_intention_prompt: string;
  care_use_note: string;
  alt_text: string;
  one_line_drop_tagline: string;
}

export interface ValidationError {
  field: string;
  message: string;
  expected?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  normalized?: ProductInput;
}

export type ViolationType =
  | "emoji"
  | "hashtag"
  | "slang"
  | "internet_language"
  | "trend_label"
  | "hype_phrase"
  | "exclamation"
  | "seasonal_mention"
  | "avoid_list_violation";

export interface StyleViolation {
  section: keyof NarrativeBundle;
  violation_type: ViolationType;
  matched_pattern: string;
  position: number;
}

export interface StyleValidationResult {
  valid: boolean;
  violations: StyleViolation[];
}

export interface ToneModifiers {
  intensity: "gentle" | "moderate" | "strong";
  sentence_length: "short" | "medium" | "varied";
  mysticism_level: "grounded" | "balanced" | "elevated";
}

export interface GenerationContext {
  input: ProductInput;
  tone_modifiers: ToneModifiers;
}
