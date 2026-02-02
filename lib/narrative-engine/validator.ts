import type {
  ProductInput,
  ValidationResult,
  ValidationError,
  ItemType,
  PrimarySymbol,
  EmotionalCore,
  EnergyTone,
  LimitedType,
  IntendedUse,
} from './types';

const VALID_ITEM_TYPES: ItemType[] = [
  "jewelry",
  "apparel",
  "home_object",
  "altar_piece",
  "wearable_symbol"
];

const VALID_PRIMARY_SYMBOLS: PrimarySymbol[] = [
  "moon",
  "rose",
  "heart",
  "blade",
  "bone",
  "mirror",
  "candle"
];

const VALID_EMOTIONAL_CORES: EmotionalCore[] = [
  "devotion",
  "grief",
  "protection",
  "longing",
  "transformation",
  "memory",
  "power"
];

const VALID_ENERGY_TONES: EnergyTone[] = [
  "soft_whispered",
  "balanced_reverent",
  "dark_commanding"
];

const VALID_LIMITED_TYPES: LimitedType[] = ["yes", "no", "numbered"];

const VALID_INTENDED_USES: IntendedUse[] = [
  "worn_daily",
  "worn_intentionally",
  "displayed",
  "gifted"
];

export function validateInput(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if input is an object
  if (!input || typeof input !== 'object') {
    return {
      valid: false,
      errors: [{
        field: 'input',
        message: 'Input must be an object',
      }]
    };
  }

  const data = input as Record<string, unknown>;

  // Validate required fields
  if (!data.item_name) {
    errors.push({
      field: 'item_name',
      message: 'Required field missing',
    });
  } else if (typeof data.item_name !== 'string') {
    errors.push({
      field: 'item_name',
      message: 'Must be a non-empty string',
    });
  } else if (data.item_name.trim() === '') {
    errors.push({
      field: 'item_name',
      message: 'Must be a non-empty string',
    });
  }

  if (!data.item_type) {
    errors.push({
      field: 'item_type',
      message: 'Required field missing',
    });
  } else if (!VALID_ITEM_TYPES.includes(data.item_type as ItemType)) {
    errors.push({
      field: 'item_type',
      message: 'Invalid enum value',
      expected: VALID_ITEM_TYPES,
    });
  }

  if (!data.primary_symbol) {
    errors.push({
      field: 'primary_symbol',
      message: 'Required field missing',
    });
  } else if (!VALID_PRIMARY_SYMBOLS.includes(data.primary_symbol as PrimarySymbol)) {
    errors.push({
      field: 'primary_symbol',
      message: 'Invalid enum value',
      expected: VALID_PRIMARY_SYMBOLS,
    });
  }

  if (!data.emotional_core) {
    errors.push({
      field: 'emotional_core',
      message: 'Required field missing',
    });
  } else if (!VALID_EMOTIONAL_CORES.includes(data.emotional_core as EmotionalCore)) {
    errors.push({
      field: 'emotional_core',
      message: 'Invalid enum value',
      expected: VALID_EMOTIONAL_CORES,
    });
  }

  if (!data.energy_tone) {
    errors.push({
      field: 'energy_tone',
      message: 'Required field missing',
    });
  } else if (!VALID_ENERGY_TONES.includes(data.energy_tone as EnergyTone)) {
    errors.push({
      field: 'energy_tone',
      message: 'Invalid enum value',
      expected: VALID_ENERGY_TONES,
    });
  }

  // Validate optional fields if present
  if (data.drop_name !== undefined) {
    if (typeof data.drop_name !== 'string' || data.drop_name.trim() === '') {
      errors.push({
        field: 'drop_name',
        message: 'Must be a non-empty string',
      });
    }
  }

  if (data.limited !== undefined) {
    if (!VALID_LIMITED_TYPES.includes(data.limited as LimitedType)) {
      errors.push({
        field: 'limited',
        message: 'Invalid enum value',
        expected: VALID_LIMITED_TYPES,
      });
    }
  }

  if (data.intended_use !== undefined) {
    if (!VALID_INTENDED_USES.includes(data.intended_use as IntendedUse)) {
      errors.push({
        field: 'intended_use',
        message: 'Invalid enum value',
        expected: VALID_INTENDED_USES,
      });
    }
  }

  if (data.avoid_list !== undefined) {
    if (!Array.isArray(data.avoid_list)) {
      errors.push({
        field: 'avoid_list',
        message: 'Must be an array of strings',
      });
    } else if (!data.avoid_list.every(item => typeof item === 'string')) {
      errors.push({
        field: 'avoid_list',
        message: 'All items must be strings',
      });
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    normalized: data as unknown as ProductInput,
  };
}
