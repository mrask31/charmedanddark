import type { NarrativeBundle, StyleViolation, StyleValidationResult } from './types';
import { FORBIDDEN_PATTERNS } from './forbidden-patterns';

function findPatternMatches(
  text: string,
  pattern: RegExp,
  violationType: StyleViolation['violation_type']
): Array<{ matched_pattern: string; position: number }> {
  const matches: Array<{ matched_pattern: string; position: number }> = [];
  let match;
  
  // Reset lastIndex for global regex
  pattern.lastIndex = 0;
  
  while ((match = pattern.exec(text)) !== null) {
    matches.push({
      matched_pattern: match[0],
      position: match.index,
    });
  }
  
  return matches;
}

function findStringMatches(
  text: string,
  patterns: readonly string[],
  violationType: StyleViolation['violation_type']
): Array<{ matched_pattern: string; position: number }> {
  const matches: Array<{ matched_pattern: string; position: number }> = [];
  const lowerText = text.toLowerCase();
  
  for (const pattern of patterns) {
    const lowerPattern = pattern.toLowerCase();
    let index = lowerText.indexOf(lowerPattern);
    
    while (index !== -1) {
      // Check word boundaries to avoid false positives
      const beforeChar = index > 0 ? text[index - 1] : ' ';
      const afterChar = index + pattern.length < text.length ? text[index + pattern.length] : ' ';
      const isWordBoundary = /\W/.test(beforeChar) && /\W/.test(afterChar);
      
      if (isWordBoundary) {
        matches.push({
          matched_pattern: text.substring(index, index + pattern.length),
          position: index,
        });
      }
      
      index = lowerText.indexOf(lowerPattern, index + 1);
    }
  }
  
  return matches;
}

export function validateStyle(
  bundle: NarrativeBundle,
  avoid_list?: string[]
): StyleValidationResult {
  const violations: StyleViolation[] = [];
  
  // Check each section of the bundle
  for (const [section, text] of Object.entries(bundle) as Array<[keyof NarrativeBundle, string]>) {
    // Check emoji
    const emojiMatches = findPatternMatches(text, FORBIDDEN_PATTERNS.emoji, 'emoji');
    for (const match of emojiMatches) {
      violations.push({
        section,
        violation_type: 'emoji',
        matched_pattern: match.matched_pattern,
        position: match.position,
      });
    }
    
    // Check hashtag
    const hashtagMatches = findPatternMatches(text, FORBIDDEN_PATTERNS.hashtag, 'hashtag');
    for (const match of hashtagMatches) {
      violations.push({
        section,
        violation_type: 'hashtag',
        matched_pattern: match.matched_pattern,
        position: match.position,
      });
    }
    
    // Check exclamation
    const exclamationMatches = findPatternMatches(text, FORBIDDEN_PATTERNS.exclamation, 'exclamation');
    for (const match of exclamationMatches) {
      violations.push({
        section,
        violation_type: 'exclamation',
        matched_pattern: match.matched_pattern,
        position: match.position,
      });
    }
    
    // Check slang
    const slangMatches = findStringMatches(text, FORBIDDEN_PATTERNS.slang, 'slang');
    for (const match of slangMatches) {
      violations.push({
        section,
        violation_type: 'slang',
        matched_pattern: match.matched_pattern,
        position: match.position,
      });
    }
    
    // Check internet language
    const internetMatches = findStringMatches(text, FORBIDDEN_PATTERNS.internet_language, 'internet_language');
    for (const match of internetMatches) {
      violations.push({
        section,
        violation_type: 'internet_language',
        matched_pattern: match.matched_pattern,
        position: match.position,
      });
    }
    
    // Check trend labels
    const trendMatches = findStringMatches(text, FORBIDDEN_PATTERNS.trend_labels, 'trend_label');
    for (const match of trendMatches) {
      violations.push({
        section,
        violation_type: 'trend_label',
        matched_pattern: match.matched_pattern,
        position: match.position,
      });
    }
    
    // Check hype phrases
    const hypeMatches = findStringMatches(text, FORBIDDEN_PATTERNS.hype_phrases, 'hype_phrase');
    for (const match of hypeMatches) {
      violations.push({
        section,
        violation_type: 'hype_phrase',
        matched_pattern: match.matched_pattern,
        position: match.position,
      });
    }
    
    // Check seasonal mentions
    const seasonalMatches = findStringMatches(text, FORBIDDEN_PATTERNS.seasonal_mentions, 'seasonal_mention');
    for (const match of seasonalMatches) {
      violations.push({
        section,
        violation_type: 'seasonal_mention',
        matched_pattern: match.matched_pattern,
        position: match.position,
      });
    }
    
    // Check avoid list if provided
    if (avoid_list && avoid_list.length > 0) {
      const avoidMatches = findStringMatches(text, avoid_list, 'avoid_list_violation');
      for (const match of avoidMatches) {
        violations.push({
          section,
          violation_type: 'avoid_list_violation',
          matched_pattern: match.matched_pattern,
          position: match.position,
        });
      }
    }
  }
  
  return {
    valid: violations.length === 0,
    violations,
  };
}
