import { validateStyle } from '../style-validator';
import type { NarrativeBundle } from '../types';

describe('Style Validator', () => {
  const cleanBundle: NarrativeBundle = {
    short_description: 'A ring of devotion.',
    long_ritual_description: 'This piece carries meaning.',
    ritual_intention_prompt: 'Hold this close.',
    care_use_note: 'Keep it safe.',
    alt_text: 'Silver ring with moon symbol.',
    one_line_drop_tagline: 'Devotion made tangible.',
  };

  describe('Emoji detection', () => {
    it('should detect emoji in short_description', () => {
      const bundle = {
        ...cleanBundle,
        short_description: 'A ring of devotion 🌙',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          section: 'short_description',
          violation_type: 'emoji',
          matched_pattern: '🌙',
        })
      );
    });

    it('should pass when no emoji present', () => {
      const result = validateStyle(cleanBundle);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });

  describe('Hashtag detection', () => {
    it('should detect hashtag in long_ritual_description', () => {
      const bundle = {
        ...cleanBundle,
        long_ritual_description: 'This piece carries meaning #gothic',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          section: 'long_ritual_description',
          violation_type: 'hashtag',
          matched_pattern: '#gothic',
        })
      );
    });

    it('should pass when no hashtag present', () => {
      const result = validateStyle(cleanBundle);
      expect(result.valid).toBe(true);
    });
  });

  describe('Exclamation detection', () => {
    it('should detect exclamation in ritual_intention_prompt', () => {
      const bundle = {
        ...cleanBundle,
        ritual_intention_prompt: 'Hold this close!',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          section: 'ritual_intention_prompt',
          violation_type: 'exclamation',
          matched_pattern: '!',
        })
      );
    });

    it('should pass when no exclamation present', () => {
      const result = validateStyle(cleanBundle);
      expect(result.valid).toBe(true);
    });
  });

  describe('Hype phrase detection', () => {
    it('should detect "perfect for" in short_description', () => {
      const bundle = {
        ...cleanBundle,
        short_description: 'Perfect for daily wear.',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          section: 'short_description',
          violation_type: 'hype_phrase',
          matched_pattern: expect.stringMatching(/perfect for/i),
        })
      );
    });

    it('should detect "must-have" in care_use_note', () => {
      const bundle = {
        ...cleanBundle,
        care_use_note: 'A must-have piece.',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          section: 'care_use_note',
          violation_type: 'hype_phrase',
          matched_pattern: expect.stringMatching(/must-have/i),
        })
      );
    });

    it('should detect "amazing" in long_ritual_description', () => {
      const bundle = {
        ...cleanBundle,
        long_ritual_description: 'This amazing piece carries meaning.',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          section: 'long_ritual_description',
          violation_type: 'hype_phrase',
          matched_pattern: expect.stringMatching(/amazing/i),
        })
      );
    });

    it('should pass when no hype phrases present', () => {
      const result = validateStyle(cleanBundle);
      expect(result.valid).toBe(true);
    });
  });

  describe('Seasonal mention detection', () => {
    it('should detect "halloween" in short_description', () => {
      const bundle = {
        ...cleanBundle,
        short_description: 'Perfect for halloween.',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          section: 'short_description',
          violation_type: 'seasonal_mention',
          matched_pattern: expect.stringMatching(/halloween/i),
        })
      );
    });

    it('should detect "winter" in long_ritual_description', () => {
      const bundle = {
        ...cleanBundle,
        long_ritual_description: 'A piece for winter nights.',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          section: 'long_ritual_description',
          violation_type: 'seasonal_mention',
          matched_pattern: expect.stringMatching(/winter/i),
        })
      );
    });

    it('should pass when no seasonal mentions present', () => {
      const result = validateStyle(cleanBundle);
      expect(result.valid).toBe(true);
    });
  });

  describe('Slang detection', () => {
    it('should detect "gonna" in ritual_intention_prompt', () => {
      const bundle = {
        ...cleanBundle,
        ritual_intention_prompt: 'You gonna hold this close.',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          section: 'ritual_intention_prompt',
          violation_type: 'slang',
          matched_pattern: expect.stringMatching(/gonna/i),
        })
      );
    });

    it('should pass when no slang present', () => {
      const result = validateStyle(cleanBundle);
      expect(result.valid).toBe(true);
    });
  });

  describe('Internet language detection', () => {
    it('should detect "lol" in care_use_note', () => {
      const bundle = {
        ...cleanBundle,
        care_use_note: 'Keep it safe lol.',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          section: 'care_use_note',
          violation_type: 'internet_language',
          matched_pattern: expect.stringMatching(/lol/i),
        })
      );
    });

    it('should pass when no internet language present', () => {
      const result = validateStyle(cleanBundle);
      expect(result.valid).toBe(true);
    });
  });

  describe('Trend label detection', () => {
    it('should detect "witchcore" in alt_text', () => {
      const bundle = {
        ...cleanBundle,
        alt_text: 'Witchcore silver ring with moon symbol.',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          section: 'alt_text',
          violation_type: 'trend_label',
          matched_pattern: expect.stringMatching(/witchcore/i),
        })
      );
    });

    it('should detect "aesthetic" in one_line_drop_tagline', () => {
      const bundle = {
        ...cleanBundle,
        one_line_drop_tagline: 'The aesthetic of devotion.',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          section: 'one_line_drop_tagline',
          violation_type: 'trend_label',
          matched_pattern: expect.stringMatching(/aesthetic/i),
        })
      );
    });

    it('should pass when no trend labels present', () => {
      const result = validateStyle(cleanBundle);
      expect(result.valid).toBe(true);
    });
  });

  describe('Avoid list validation', () => {
    it('should detect words from avoid_list', () => {
      const bundle = {
        ...cleanBundle,
        short_description: 'A ring of eternal devotion.',
      };
      const result = validateStyle(bundle, ['eternal']);
      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          section: 'short_description',
          violation_type: 'avoid_list_violation',
          matched_pattern: expect.stringMatching(/eternal/i),
        })
      );
    });

    it('should pass when avoid_list words not present', () => {
      const result = validateStyle(cleanBundle, ['forbidden', 'words']);
      expect(result.valid).toBe(true);
    });

    it('should pass when avoid_list is empty', () => {
      const result = validateStyle(cleanBundle, []);
      expect(result.valid).toBe(true);
    });

    it('should pass when avoid_list is undefined', () => {
      const result = validateStyle(cleanBundle);
      expect(result.valid).toBe(true);
    });
  });

  describe('Multiple violations', () => {
    it('should detect multiple violations in same section', () => {
      const bundle = {
        ...cleanBundle,
        short_description: 'Perfect for halloween! 🎃',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(3);
      expect(result.violations).toContainEqual(
        expect.objectContaining({ violation_type: 'hype_phrase' })
      );
      expect(result.violations).toContainEqual(
        expect.objectContaining({ violation_type: 'seasonal_mention' })
      );
      expect(result.violations).toContainEqual(
        expect.objectContaining({ violation_type: 'exclamation' })
      );
      expect(result.violations).toContainEqual(
        expect.objectContaining({ violation_type: 'emoji' })
      );
    });

    it('should detect violations across multiple sections', () => {
      const bundle = {
        ...cleanBundle,
        short_description: 'Amazing ring!',
        long_ritual_description: 'Perfect for winter.',
      };
      const result = validateStyle(bundle);
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(3);
    });
  });
});
