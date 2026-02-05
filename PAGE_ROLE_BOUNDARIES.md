# Page-Role Boundary Enforcement

**Date**: February 5, 2026  
**Status**: ✅ AUDITED AND DOCUMENTED

---

## Invariant

**If a page displays prices or checkout paths, it must not interpret, react to, or personalize user emotion.**

This is the north star. Everything else follows from this.

---

## Boundary Rules

### 1. Commerce Pages (STATIC ONLY)

**Pages**: `/shop`, `/product/[slug]`, `/uniform`, `/uniform/[slug]`

**Allowed**:
- Static product data
- Deterministic pricing display
- Sanctuary price preview (read-only from localStorage)
- Category filtering (client-side, no state persistence)
- Variant selection (updates price/image, no personalization)

**Prohibited**:
- ❌ AI reactions or recommendations
- ❌ Environmental responses (light, glow, motion based on user state)
- ❌ Mood shifts or emotional interpretation
- ❌ Dynamic visuals based on user input
- ❌ "Recommended for you" features
- ❌ Urgency-based UI (countdown timers, "only X left")
- ❌ Personalized copy or product descriptions
- ❌ Reactive behavior of any kind

**Current Status**: ✅ COMPLIANT
- Shop page: Static product grid with category filters
- Product detail: Static display with variant selector (deterministic)
- Uniform page: Static apparel grid with drop sections
- No AI, no reactions, no personalization detected

---

### 2. Home Page (SUBTLE ATMOSPHERE ONLY)

**Page**: `/`

**Allowed**:
- Time-of-day baseline tone (if implemented, must be purely aesthetic)
- Slow ambient motion (CSS animations, no user tracking)
- Rotating non-personal copy (static rotation, no user data)
- Visual echoes of Sanctuary aesthetics (gold accents, dark palette)

**Prohibited**:
- ❌ Reacting to user input beyond form submission
- ❌ Remembering users or tracking behavior
- ❌ Emotional interpretation of user state
- ❌ Personalized content based on history
- ❌ Dynamic recommendations
- ❌ State-based visual changes

**Current Status**: ⚠️ VIOLATION DETECTED

**Issues Found**:
1. **Mirror Preview on Home Page** (`app/page.tsx` lines 18-30)
   - Interactive Mirror form that accepts user input
   - Shows reading based on user feeling
   - Displays product recommendation
   - **This is reactive behavior on a commerce-adjacent page**

**Required Fix**:
- Remove Mirror preview from home page
- Replace with static description and link to `/mirror`
- Keep Mirror functionality exclusively in `/mirror` (Sanctuary page)

---

### 3. Sanctuary Pages (REACTIVE ALLOWED)

**Pages**: `/mirror`, `/grimoire`, `/join`, sanctuary dashboard (future)

**Allowed**:
- Reactive or preactive behavior
- Environmental changes (subtle, infrequent, non-blocking)
- Emotional interpretation
- AI-powered recommendations
- Personalized content
- State-based UI changes
- Saved user data and history

**Prohibited**:
- ❌ Transactional CTAs with pricing pressure
- ❌ Checkout flows or cart functionality
- ❌ Urgency-based purchase prompts
- ❌ "Buy now" or "Add to cart" buttons

**Current Status**: ✅ COMPLIANT
- Mirror page: Reactive emotional state selection, AI readings
- Grimoire page: Personalized saved readings, notes
- Join page: Static membership signup (not audited in detail)
- No commerce pressure detected in Sanctuary pages

---

## Audit Results by Page

### ✅ `/shop` - COMPLIANT
- Static product grid
- Category filtering (client-side, deterministic)
- Sanctuary price preview (read-only)
- No reactive behavior

### ✅ `/product/[slug]` - COMPLIANT
- Static product display
- Variant selector (deterministic price/image updates)
- No personalization or AI
- No reactive behavior

### ✅ `/uniform` - COMPLIANT
- Static apparel grid
- Core uniform + seasonal drops
- Sanctuary price preview (read-only)
- No reactive behavior

### ⚠️ `/` (Home Page) - VIOLATION
**Issue**: Interactive Mirror preview with reactive behavior
**Fix Required**: Remove Mirror preview, replace with static link

### ✅ `/mirror` - COMPLIANT
- Reactive emotional state selection (allowed in Sanctuary)
- AI-powered readings (allowed in Sanctuary)
- Product recommendations (allowed in Sanctuary)
- No commerce pressure

### ✅ `/grimoire` - COMPLIANT
- Personalized saved readings (allowed in Sanctuary)
- User notes (allowed in Sanctuary)
- No commerce pressure

---

## Required Changes

### 1. Remove Mirror Preview from Home Page

**File**: `app/page.tsx`

**Current Code** (lines 18-30, 48-95):
```typescript
const [feeling, setFeeling] = useState('');
const [showReading, setShowReading] = useState(false);

const handleMirrorSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (feeling.trim()) {
    setShowReading(true);
    // TODO: Integrate actual Mirror AI experience
  }
};

// ... Mirror section with interactive form
```

**Required Change**:
Replace interactive Mirror preview with static description:

```typescript
{/* SECTION 2: THE MIRROR */}
<section className="mirror-section">
  <div className="mirror-container">
    <h2 className="mirror-headline">The Mirror</h2>
    
    <p className="mirror-description">
      Your mood. Your object. The Mirror recommends what you need.
    </p>
    
    <p className="mirror-note">
      Not random. Not a feed. Just you and the recommendation.
    </p>

    <div className="mirror-preview">
      <p className="mirror-preview-text">
        The Mirror is a private place to pause. It reflects without fixing.
      </p>
      <Link href="/mirror" className="mirror-preview-cta">
        Enter The Mirror →
      </Link>
    </div>
  </div>
</section>
```

---

## Decision Rules

### When to Allow Reactive Behavior

**Question**: Does this feature introduce emotional interpretation or reactive behavior?
- **YES** → Must live in Sanctuary (`/mirror`, `/grimoire`, etc.)
- **NO** → Can live anywhere

### When to Keep Static

**Question**: Does this feature support purchasing or display prices?
- **YES** → Must remain static and predictable
- **NO** → May have subtle atmosphere (home page only)

### Bridge Between Commerce and Sanctuary

**Allowed**:
- Visual aesthetics (gold accents, dark palette)
- Static descriptions of Sanctuary features
- Links to Sanctuary pages

**Prohibited**:
- Logic connections between commerce and Sanctuary
- State sharing between commerce and Sanctuary
- Personalization on commerce pages

---

## Testing Checklist

Before deploying any new feature, verify:

- [ ] Commerce pages remain static (no AI, no reactions)
- [ ] Home page has no interactive reactive elements
- [ ] Sanctuary pages are the only place with reactive behavior
- [ ] No emotional interpretation on pages with prices
- [ ] No "recommended for you" outside Sanctuary
- [ ] No urgency-based UI on commerce pages
- [ ] Pricing remains stable and deterministic

---

## Enforcement

**Automated**:
- Add ESLint rule to detect useState/useEffect in commerce page components
- Add test to verify no AI imports in commerce pages
- Add test to verify no localStorage writes in commerce pages (reads OK for Sanctuary preview)

**Manual**:
- Code review checklist for new features
- Quarterly audit of page boundaries
- User testing to verify no reactive behavior on commerce pages

---

## Summary

**Compliant Pages**: 5/6
**Violations**: 1 (Home page Mirror preview)
**Required Fixes**: 1 (Remove interactive Mirror from home page)

Once the home page Mirror preview is removed and replaced with a static link, all page-role boundaries will be enforced correctly.

---

**Audited By**: Kiro AI  
**Audit Date**: February 5, 2026
