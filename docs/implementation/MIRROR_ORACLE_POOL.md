# The Mirror Oracle Pool - Locked Inventory

## Purpose

This document defines the complete set of mirror-eligible objects. This pool is **locked at 16 items** to maintain the Mirror's authority through precision, not variety.

**Rule:** No new items may be added to this pool without removing an existing item and documenting the psychological reason for the change.

---

## The Locked Pool (16 Objects)

### 1. Midnight Candle
- **Slug:** `midnight-candle`
- **Type:** Product
- **Mirror Roles:** Containment, Warmth, Return
- **States:** Overwhelmed, Distant
- **Why:** Heavy vessel (containment), emits warmth, invites repeated ritual

### 2. Three Star Candle
- **Slug:** `three-star-candle`
- **Type:** Product
- **Mirror Roles:** Warmth, Orientation
- **States:** Tired, Uncertain
- **Why:** Soft light (warmth), archetypal symbol (orientation)

### 3. Obsidian Dish
- **Slug:** `obsidian-dish`
- **Type:** Product
- **Mirror Roles:** Containment, Amplification
- **States:** Overwhelmed, Quiet
- **Why:** Holds/contains, minimal matte surface

### 4. Tabletop Mirror
- **Slug:** `tabletop-mirror`
- **Type:** Product
- **Mirror Roles:** Witness, Orientation
- **States:** Unseen, Uncertain
- **Why:** Looks back (witness), constant/neutral (orientation)

### 5. Charcuterie Board
- **Slug:** `charcuterie-board`
- **Type:** Product
- **Mirror Roles:** Boundary
- **States:** Restless
- **Why:** Marks space, creates separation

### 6. Two-Tier Tray
- **Slug:** `two-tier-tray`
- **Type:** Product
- **Mirror Roles:** Boundary
- **States:** Restless
- **Why:** Defines edges, interrupts pacing

### 7. Skull Bookends
- **Slug:** `skull-bookends`
- **Type:** Product
- **Mirror Roles:** Grounding
- **States:** Heavy
- **Why:** Literal weight, solid, anchored

### 8. Black Vase
- **Slug:** `black-vase`
- **Type:** Product
- **Mirror Roles:** Grounding, Amplification
- **States:** Heavy, Quiet
- **Why:** Weight when filled (grounding), minimal/refined (amplification)

### 9. Stars Wall Art
- **Slug:** `stars-wall-art`
- **Type:** Product
- **Mirror Roles:** Witness
- **States:** Unseen
- **Why:** Static, present, quiet gaze

### 10. Sage Bundle
- **Slug:** `sage-bundle`
- **Type:** Product
- **Mirror Roles:** Return
- **States:** Distant
- **Why:** Ritual tool, repeatable, invites return

### 11. Ritual Mug
- **Slug:** `ritual-mug`
- **Type:** Product
- **Mirror Roles:** Warmth
- **States:** Tired
- **Why:** Holds heat, no decisions, invites stillness

---

## Mirror Role Distribution

- **Containment:** 2 objects (Midnight Candle, Trinket Dish)
- **Warmth:** 3 objects (Midnight Candle, Three Star Candle, Ritual Mug)
- **Witness:** 2 objects (Mirror, Wall Art)
- **Boundary:** 2 objects (Charcuterie Board, Display Tray)
- **Grounding:** 2 objects (Skull Bookends, Ceramic Vase)
- **Return:** 2 objects (Midnight Candle, Sage Bundle)
- **Amplification:** 2 objects (Trinket Dish, Ceramic Vase)
- **Orientation:** 2 objects (Three Star Candle, Mirror)

**Note:** Some objects serve multiple roles across different emotional states. This is intentional—it creates familiarity and inevitability.

---

## Emotional State Coverage

Each state has exactly 2 readings, using objects from the pool:

- **Overwhelmed:** Midnight Candle, Obsidian Dish
- **Tired:** Ritual Mug, Three Star Candle
- **Unseen:** Tabletop Mirror, Stars Wall Art
- **Restless:** Two-Tier Tray, Charcuterie Board
- **Heavy:** Skull Bookends, Black Vase
- **Distant:** Midnight Candle, Sage Bundle
- **Quiet:** Obsidian Dish, Black Vase
- **Uncertain:** Three Star Candle, Tabletop Mirror

---

## What This Pool Excludes (And Why)

### Excluded: All Apparel
**Reason:** Apparel introduces size/fit anxiety. The Mirror removes choice.

### Excluded: Heart Vase
**Reason:** Too expressive/narrative for Uncertain state. Violates orientation need.

### Excluded: Cheese Knives
**Reason:** Functional/utility. The Mirror suggests presence, not tasks.

### Excluded: All Uniform Items
**Reason:** Apparel cannot serve witness, grounding, or containment roles effectively.

---

## Adding New Items to the Pool (Rare, Controlled)

If a new product must be added to the Mirror pool:

1. **Identify which existing item it replaces**
2. **Document the psychological reason** (not sales reason)
3. **Update all affected readings** in `lib/mirrorReadings.ts`
4. **Update this document** with the change log
5. **Maintain the 16-item limit**

**This is not a growth strategy. This is a precision strategy.**

---

## Backend Implementation Notes

### Product Classification Flags

Each product in `lib/products.ts` should eventually include:

```typescript
{
  // ... other fields
  mirrorEligible: boolean,  // defaults to false
  mirrorRole?: MirrorRole   // only if mirrorEligible is true
}
```

### Apparel Classification Flags

Each apparel item in `lib/apparel.ts` should include:

```typescript
{
  // ... other fields
  mirrorEligible: boolean,  // defaults to false (always false for apparel)
  mirrorRole?: MirrorRole   // never set for apparel
}
```

**Rule:** `mirrorEligible` defaults to `false`. This prevents accidental Mirror creep as inventory grows.

---

## Product Page Echo (Optional, Safe)

For Sanctuary members viewing a mirror-eligible product:

**Add one line:**
> "This object has appeared here before."

**Rules:**
- No explanation
- No link
- No frequency
- Only for Sanctuary members
- Only for mirror-eligible items

**Purpose:** Reinforces inevitability without prompting action.

---

## Drop Discipline

When releasing new items (especially member-first drops):

1. **Do NOT automatically mark as mirror-eligible**
2. Let them exist without meaning first
3. Elevate only after they prove symbolic longevity
4. This prevents trend contamination of the oracle

**The Mirror does not chase relevance. It holds authority.**

---

## What NOT to Do (Forever)

❌ "Recommended for you"  
❌ Emotion-based email nudges  
❌ "When you felt ___"  
❌ Dynamic reordering of the shop  
❌ AI-generated new Mirror content without review  

**If the system starts chasing relevance, it will lose authority.**

---

## Observation Phase

Now that the pool is locked and psychologically correct:

**Watch:**
- When people buy (not how often)
- How often objects appear in Grimoire before purchase
- Which objects build the strongest emotional pre-ownership

**That gap between Mirror appearance and purchase is where the power lives.**

---

## Change Log

### 2026-02-04: Initial Lock
- Established 16-item pool
- Removed all apparel from Mirror eligibility
- Corrected psychological role violations
- Documented in `MIRROR_PSYCHOLOGICAL_RULES.md`

---

## Final Note

This pool is not a product catalog. It is a psychological instrument.

Precision beats variety every time in meaning-based systems.

The Mirror's authority comes from what it doesn't say, not what it offers.
