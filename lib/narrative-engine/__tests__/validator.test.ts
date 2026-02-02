import { validateInput } from '../validator';
import type { ProductInput } from '../types';

describe('Input Validator', () => {
  const validInput: ProductInput = {
    item_name: 'Test Ring',
    item_type: 'jewelry',
    primary_symbol: 'moon',
    emotional_core: 'devotion',
    energy_tone: 'balanced_reverent',
  };

  describe('Required field validation', () => {
    it('should accept valid input with all required fields', () => {
      const result = validateInput(validInput);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(result.normalized).toEqual(validInput);
    });

    it('should reject input missing item_name', () => {
      const { item_name, ...input } = validInput;
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'item_name',
        message: 'Required field missing',
      });
    });

    it('should reject input with empty item_name', () => {
      const input = { ...validInput, item_name: '   ' };
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'item_name',
        message: 'Must be a non-empty string',
      });
    });

    it('should reject input missing item_type', () => {
      const { item_type, ...input } = validInput;
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'item_type',
        message: 'Required field missing',
      });
    });

    it('should reject input missing primary_symbol', () => {
      const { primary_symbol, ...input } = validInput;
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'primary_symbol',
        message: 'Required field missing',
      });
    });

    it('should reject input missing emotional_core', () => {
      const { emotional_core, ...input } = validInput;
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'emotional_core',
        message: 'Required field missing',
      });
    });

    it('should reject input missing energy_tone', () => {
      const { energy_tone, ...input } = validInput;
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'energy_tone',
        message: 'Required field missing',
      });
    });
  });

  describe('Enum validation', () => {
    it('should reject invalid item_type', () => {
      const input = { ...validInput, item_type: 'invalid' };
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'item_type',
        message: 'Invalid enum value',
        expected: ['jewelry', 'apparel', 'home_object', 'altar_piece', 'wearable_symbol'],
      });
    });

    it('should reject invalid primary_symbol', () => {
      const input = { ...validInput, primary_symbol: 'invalid' };
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'primary_symbol',
        message: 'Invalid enum value',
        expected: ['moon', 'rose', 'heart', 'blade', 'bone', 'mirror', 'candle'],
      });
    });

    it('should reject invalid emotional_core', () => {
      const input = { ...validInput, emotional_core: 'invalid' };
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'emotional_core',
        message: 'Invalid enum value',
        expected: ['devotion', 'grief', 'protection', 'longing', 'transformation', 'memory', 'power'],
      });
    });

    it('should reject invalid energy_tone', () => {
      const input = { ...validInput, energy_tone: 'invalid' };
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'energy_tone',
        message: 'Invalid enum value',
        expected: ['soft_whispered', 'balanced_reverent', 'dark_commanding'],
      });
    });

    it('should reject invalid limited type', () => {
      const input = { ...validInput, limited: 'invalid' };
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'limited',
        message: 'Invalid enum value',
        expected: ['yes', 'no', 'numbered'],
      });
    });

    it('should reject invalid intended_use', () => {
      const input = { ...validInput, intended_use: 'invalid' };
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'intended_use',
        message: 'Invalid enum value',
        expected: ['worn_daily', 'worn_intentionally', 'displayed', 'gifted'],
      });
    });
  });

  describe('Type validation', () => {
    it('should reject non-object input', () => {
      const result = validateInput('not an object');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'input',
        message: 'Input must be an object',
      });
    });

    it('should reject null input', () => {
      const result = validateInput(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'input',
        message: 'Input must be an object',
      });
    });

    it('should reject non-string item_name', () => {
      const input = { ...validInput, item_name: 123 };
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'item_name',
        message: 'Must be a non-empty string',
      });
    });

    it('should reject non-string drop_name', () => {
      const input = { ...validInput, drop_name: 123 };
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'drop_name',
        message: 'Must be a non-empty string',
      });
    });

    it('should reject empty drop_name', () => {
      const input = { ...validInput, drop_name: '' };
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'drop_name',
        message: 'Must be a non-empty string',
      });
    });

    it('should reject non-array avoid_list', () => {
      const input = { ...validInput, avoid_list: 'not an array' };
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'avoid_list',
        message: 'Must be an array of strings',
      });
    });

    it('should reject avoid_list with non-string items', () => {
      const input = { ...validInput, avoid_list: ['valid', 123, 'also valid'] };
      const result = validateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'avoid_list',
        message: 'All items must be strings',
      });
    });
  });

  describe('Optional field validation', () => {
    it('should accept valid input with all optional fields', () => {
      const input: ProductInput = {
        ...validInput,
        drop_name: 'Test Drop',
        limited: 'numbered',
        intended_use: 'worn_intentionally',
        avoid_list: ['word1', 'word2'],
      };
      const result = validateInput(input);
      expect(result.valid).toBe(true);
      expect(result.normalized).toEqual(input);
    });

    it('should accept valid input without optional fields', () => {
      const result = validateInput(validInput);
      expect(result.valid).toBe(true);
      expect(result.normalized).toEqual(validInput);
    });
  });
});
