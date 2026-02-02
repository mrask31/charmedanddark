// Forbidden language patterns for style validation

export const FORBIDDEN_PATTERNS = {
  emoji: /[\u{1F300}-\u{1F9FF}]/gu,
  hashtag: /#\w+/g,
  exclamation: /!/g,
  
  slang: [
    "gonna", "wanna", "gotta", "kinda", "sorta",
    "yeah", "nope", "yep", "nah"
  ],
  
  internet_language: [
    "lol", "omg", "tbh", "imo", "fyi", "btw",
    "af", "lowkey", "highkey", "literally"
  ],
  
  trend_labels: [
    "witchcore", "spooky", "goth girl", "dark academia",
    "cottagecore", "aesthetic", "vibe", "vibes"
  ],
  
  hype_phrases: [
    "perfect for", "must-have", "statement piece",
    "you'll love", "amazing", "stunning", "gorgeous",
    "obsessed", "iconic", "slay", "serve"
  ],
  
  seasonal_mentions: [
    "spring", "summer", "fall", "autumn", "winter",
    "halloween", "christmas", "valentine", "holiday"
  ]
} as const;
