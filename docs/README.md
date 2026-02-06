# Charmed & Dark - Documentation Index

This directory contains implementation history, verification documents, and task summaries.

---

## ⚠️ Current Source of Truth

For active development and behavior, rely on:

1. **[PAGE_ROLE_BOUNDARIES.md](../PAGE_ROLE_BOUNDARIES.md)** - Commerce vs Sanctuary law (enforced)
2. **`lib/__tests__/inventory-invariants.test.ts`** - Minimum counts enforced in CI
3. **`.kiro/specs/`** - Feature requirements and designs

**All documents in this `docs/` directory are historical context** unless explicitly referenced by a spec.

---

## Active Guardrails

These documents define critical system invariants:

- **[PAGE_ROLE_BOUNDARIES.md](../PAGE_ROLE_BOUNDARIES.md)** - Commerce vs Sanctuary separation rules
- **[INVENTORY_GUARDRAIL_COMPLETE.md](./implementation/INVENTORY_GUARDRAIL_COMPLETE.md)** - Minimum inventory count enforcement (historical - see test file for enforcement)

## Implementation History

Complete implementation documentation organized by feature:

### Product & Inventory
- [INVENTORY_EXPANSION_COMPLETE.md](./implementation/INVENTORY_EXPANSION_COMPLETE.md)
- [INVENTORY_VERIFICATION.md](./implementation/INVENTORY_VERIFICATION.md)
- [FULL_INVENTORY_EXPANSION.md](./implementation/FULL_INVENTORY_EXPANSION.md)
- [PRODUCT_CATALOG_COMPLETE.md](./implementation/PRODUCT_CATALOG_COMPLETE.md)
- [PRODUCT_CATALOG_IMPLEMENTATION.md](./implementation/PRODUCT_CATALOG_IMPLEMENTATION.md)
- [PRODUCT_FINALIZATION.md](./implementation/PRODUCT_FINALIZATION.md)
- [PRODUCT_INTEGRATION_COMPLETE.md](./implementation/PRODUCT_INTEGRATION_COMPLETE.md)
- [HOUSE_VISIBILITY_VARIANTS.md](./implementation/HOUSE_VISIBILITY_VARIANTS.md)

### Narrative Engine
- [NARRATIVE_ENGINE_IMPLEMENTATION.md](./implementation/NARRATIVE_ENGINE_IMPLEMENTATION.md)
- [NARRATIVE_STUDIO_COMPLETE.md](./implementation/NARRATIVE_STUDIO_COMPLETE.md)
- [NARRATIVE_STUDIO_IMPLEMENTATION.md](./implementation/NARRATIVE_STUDIO_IMPLEMENTATION.md)
- [NARRATIVE_STUDIO_EDIT_LOCK.md](./implementation/NARRATIVE_STUDIO_EDIT_LOCK.md)
- [NARRATIVE_STUDIO_EXPORT.md](./implementation/NARRATIVE_STUDIO_EXPORT.md)
- [NARRATIVE_STUDIO_PERSISTENCE.md](./implementation/NARRATIVE_STUDIO_PERSISTENCE.md)
- [NARRATIVE_STUDIO_SAFEGUARDS.md](./implementation/NARRATIVE_STUDIO_SAFEGUARDS.md)
- [NARRATIVE_STUDIO_TESTING.md](./implementation/NARRATIVE_STUDIO_TESTING.md)
- [PRODUCT_CATALOG_NARRATIVE_LINKING_SUMMARY.md](./implementation/PRODUCT_CATALOG_NARRATIVE_LINKING_SUMMARY.md)
- [PRODUCT_NARRATIVE_LINKING.md](./implementation/PRODUCT_NARRATIVE_LINKING.md)

### Mirror & Sanctuary
- [MIRROR_IMPLEMENTATION.md](./implementation/MIRROR_IMPLEMENTATION.md)
- [MIRROR_ORACLE_POOL.md](./implementation/MIRROR_ORACLE_POOL.md)
- [MIRROR_PSYCHOLOGICAL_RULES.md](./implementation/MIRROR_PSYCHOLOGICAL_RULES.md)
- [GRIMOIRE_IMPLEMENTATION.md](./implementation/GRIMOIRE_IMPLEMENTATION.md)
- [SANCTUARY_NAVIGATION_IMPLEMENTATION.md](./implementation/SANCTUARY_NAVIGATION_IMPLEMENTATION.md)

### UI & Visual System
- [IMPLEMENTATION.md](./implementation/IMPLEMENTATION.md)
- [LANDING_PAGE.md](./implementation/LANDING_PAGE.md)
- [UNIFORM_IMPLEMENTATION.md](./implementation/UNIFORM_IMPLEMENTATION.md)
- [WILL_CHANGE_PERFORMANCE.md](./implementation/WILL_CHANGE_PERFORMANCE.md)
- [KEYBOARD_FOCUS_TEST.md](./implementation/KEYBOARD_FOCUS_TEST.md)

### Page-Role Enforcement
- [PAGE_ROLE_ENFORCEMENT_COMPLETE.md](./implementation/PAGE_ROLE_ENFORCEMENT_COMPLETE.md)

### Drops & Collections
- [DROPS_COLLECTIONS.md](./implementation/DROPS_COLLECTIONS.md)
- [LAUNCH_BOARD.md](./implementation/LAUNCH_BOARD.md)
- [PUBLISH_PACK_EXPORT.md](./implementation/PUBLISH_PACK_EXPORT.md)

### Fulfillment & Verification
- [FULFILLMENT_GUARDRAILS.md](./implementation/FULFILLMENT_GUARDRAILS.md)
- [VERIFICATION_COMPLETE.md](./implementation/VERIFICATION_COMPLETE.md)
- [SMOKE_TEST_RESULTS.md](./implementation/SMOKE_TEST_RESULTS.md)

### Task Summaries
- [TASK_9.2_SUMMARY.md](./implementation/TASK_9.2_SUMMARY.md)
- [TASK_11.3_SUMMARY.md](./implementation/TASK_11.3_SUMMARY.md)
- [STEP_C_COMPLETE.md](./implementation/STEP_C_COMPLETE.md)

### Session Management
- [SESSION_HANDOFF.md](./implementation/SESSION_HANDOFF.md)
- [FINAL_SHIP_CHECKLIST.md](./implementation/FINAL_SHIP_CHECKLIST.md)

## Specs

Feature specifications are located in `.kiro/specs/`:
- accent-reveal-system
- cart
- checkout
- inventory-expansion
- product-detail
- product-discovery
- product-narrative-engine
- visual-system

Each spec contains:
- `requirements.md` - User stories and acceptance criteria
- `design.md` - Technical design and correctness properties
- `tasks.md` - Implementation task list

**These specs are the source of truth for feature behavior.**

---

## Historical Context

All documents below are **implementation history only**. They document how features were built but are not authoritative for current behavior. Refer to specs and active guardrails above for current system behavior.

---

**Last Updated**: February 5, 2026
