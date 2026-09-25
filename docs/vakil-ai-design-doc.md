# Vakil AI — Design Document
### Indian Legal Assistance Platform · v1.0 · PromptWars Virtual

---

## Table of contents

1. [Product overview](#1-product-overview)
2. [Design philosophy](#2-design-philosophy)
3. [Colour system](#3-colour-system)
4. [Typography](#4-typography)
5. [Motion language](#5-motion-language)
6. [Component library](#6-component-library)
7. [User workflow — full UX map](#7-user-workflow--full-ux-map)
8. [Screen-by-screen layout spec](#8-screen-by-screen-layout-spec)
9. [Stage pipeline detail](#9-stage-pipeline-detail)
10. [Risk encoding system](#10-risk-encoding-system)
11. [Multi-document behaviour](#11-multi-document-behaviour)
12. [Accessibility & i18n](#12-accessibility--i18n)
13. [GenAI touch points in the UI](#13-genai-touch-points-in-the-ui)
14. [Design decisions log](#14-design-decisions-log)

---

## 1. Product overview

**Vakil AI** is an Indian-legal-context document assistance platform for ordinary citizens — tenants, freelancers, gig workers, first-time employees — who receive legal documents in English they cannot afford to have professionally reviewed.

| Attribute | Detail |
|---|---|
| Primary user | Urban Indian freelancer / tenant / new employee, 22–40 |
| Secondary user | First-generation gig worker, regional-language-first |
| Problem | Legal documents in English, no affordable review, 30M-case court backlog |
| Not a replacement for | A licensed lawyer |
| Core promise | Understand before you sign. Prepare before you meet your vakil. |

---

## 2. Design philosophy

### The tension to hold

Legal = serious, credible, precise.
Gig economy = fast, approachable, mobile-first, action-oriented.

Vakil AI must feel like both at once. The design inspo is not LegalZoom (corporate, cold) or NotionAI (too casual). It is closer to **Swiggy's delivery partner app meets a well-designed fintech dashboard** — information-dense but never intimidating, action-clear, visually calm.

### Four principles

**1. Clarity over decoration**
Every visual element earns its place by reducing cognitive load. No decorative patterns, no gradient washes as aesthetics, no chrome for chrome's sake. The document is the hero — the UI frames it, never competes with it.

**2. Trust through restraint**
Slate is the primary colour because it reads as reliable without being cold. Saffron appears only at decision points — it signals "this is where you act." One accent colour, used sparingly, carries more weight than five used everywhere.

**3. Framing, not advising**
Every output from the AI is visually framed as preparation material, not legal opinion. This is enforced at the design level — output cards use a specific "AI prepared" visual treatment that is distinct from informational content.

**4. Motion that earns its place**
One orchestrated transition per navigation event. No idle animations, no hover effects that distract. Motion answers the user's action — it confirms what changed and where they are going.

---

## 3. Colour system

### Base palette

| Token | Hex | Usage |
|---|---|---|
| `--slate-900` | `#1E293B` | Primary brand, nav, active states |
| `--slate-600` | `#475569` | Secondary text, inactive labels |
| `--slate-100` | `#F1F5F9` | Hover backgrounds, borders |
| `--slate-50` | `#F8FAFC` | Page background (desktop) |
| `--saffron-600` | `#D97706` | Primary CTA, active risk indicator |
| `--saffron-100` | `#FEF3C7` | Saffron tint backgrounds |
| `--warm-white` | `#FFFBF0` | Document pane background |
| `--text-primary` | `#0F172A` | Body text on light backgrounds |
| `--text-secondary` | `#64748B` | Supporting text, captions |
| `--text-muted` | `#94A3B8` | Placeholders, metadata |

### Risk severity palette

Risk colours are used exclusively for risk encoding. They never appear as decorative or brand elements.

| Severity | Colour | Hex | Border | Background tint |
|---|---|---|---|---|
| Critical | Red | `#E53E3E` | `#FC8181` | `#FFF5F5` |
| High | Amber | `#D97706` | `#FBD38D` | `#FFFBEB` |
| Medium | Slate blue | `#2E6DA4` | `#90CDF4` | `#EBF2FA` |
| Low | Green | `#16A34A` | `#86EFAC` | `#F0FDF4` |

### Risk category colour modifier

Each severity has a category sub-encoding applied via icon shape, never via a different colour (to preserve the severity hierarchy):

| Category | Icon | Shape |
|---|---|---|
| Direct contradiction | `ti-arrows-exchange` | Circular arrows |
| Deviation from norm | `ti-alert-triangle` | Triangle |
| Coverage gap | `ti-circle-dashed` | Dashed circle |
| Ambiguous wording | `ti-question-mark` | Question mark |

### Dark mode

Dark mode is supported from day one. Token remapping:

| Token | Light | Dark |
|---|---|---|
| Page background | `#FFFBF0` | `#0F172A` |
| Surface card | `#FFFFFF` | `#1E293B` |
| Surface elevated | `#F1F5F9` | `#263446` |
| Text primary | `#0F172A` | `#F1F5F9` |
| Text secondary | `#64748B` | `#94A3B8` |
| Border default | `rgba(15,23,42,.1)` | `rgba(241,245,249,.1)` |
| Slate primary | `#1E293B` | `#E2E8F0` |
| Saffron CTA | `#D97706` | `#F59E0B` |

---

## 4. Typography

### Typeface selection

| Role | Family | Weights | Fallback |
|---|---|---|---|
| All Latin UI | Inter | 400, 500, 700 | system-ui, sans-serif |
| Regional scripts | Noto Sans (per script) | 400, 500 | sans-serif |
| Document mono labels | JetBrains Mono | 400 | monospace |

**Inter** is chosen deliberately over the default Anthropic Sans because Inter's legal-document feel at small sizes (optimised for dense UI text at 11–14px) is superior for this specific use case. It also loads from Google Fonts at no cost.

**Noto Sans** is mandatory for regional script support — Telugu, Hindi (Devanagari), Tamil, Kannada, Malayalam, Bengali, Gujarati, Marathi, Punjabi. The same font-size and weight values apply to both Inter and Noto Sans so Latin and regional text are visually consistent.

**JetBrains Mono** is used only for clause references and section numbers inside the document pane (`§4.2`, `Clause 7`) — giving the document view a technical, precise feel distinct from the UI around it.

### Type scale

| Name | Size | Weight | Line height | Usage |
|---|---|---|---|---|
| Display | 28px | 700 | 1.2 | Landing page hero only |
| Heading 1 | 22px | 700 | 1.3 | Page-level titles |
| Heading 2 | 18px | 600 | 1.35 | Section headers |
| Heading 3 | 15px | 600 | 1.4 | Card titles, panel headers |
| Body | 14px | 400 | 1.65 | Explanation text, descriptions |
| Caption | 12px | 400 | 1.5 | Metadata, timestamps, source tags |
| Label | 11px | 500 | 1.3 | All-uppercase labels (sparingly) |
| Mono | 12px | 400 | 1.5 | Clause references, section numbers |

### Typography rules

- Sentence case everywhere. No ALL CAPS except the 11px label token in specific badge contexts.
- Maximum line length: 68 characters for body text in the explanation pane.
- Regional language text gets `line-height: 1.8` (scripts with ascenders and descenders need more breathing room than Latin).
- Never use weight 600 or 700 for body text — it reads as shouting in dense legal content.
- Document pane renders the document content at 14px / 400 weight with 1.7 line height — generous, readable, not cramped.

---

## 5. Motion language

### Primary transition — lateral slide (Linear-style)

Used for: stage navigator transitions (Stage 1→2→3→4→5).

```
Outgoing page:  translateX(0) → translateX(-60px), opacity 1 → 0
Incoming page:  translateX(60px) → translateX(0), opacity 0 → 1
Duration:       380ms
Easing:         cubic-bezier(0.4, 0, 0.2, 1)
Direction rule: Moving forward in stages = slide left. Moving back = slide right.
```

The direction of motion encodes progress — the user always knows whether they are moving forward or backward through the pipeline without reading stage labels.

### Secondary transition — spring collapse (Raycast-style)

Used for: right panel collapsing when Compare / Stage 4 opens, right panel expanding back to Overview.

```
Collapse out:   width 100% → 0, opacity 1 → 0
New panel in:   translateX(60px) → 0, opacity 0 → 1
Duration:       300ms
Easing:         cubic-bezier(0.34, 1.56, 0.64, 1)  ← slight overshoot spring
```

The spring overshoot gives the panel a physical, satisfying quality — it feels like a real drawer opening rather than a CSS display toggle.

### Tertiary — skeleton shimmer (Vercel-style)

Used for: explanation box and risk panel while AI is generating.

```
Animation:      background-position 0% → 200% on a shimmer gradient
Duration:       1.2s linear infinite loop
Stop:           Immediately on content arrival, cross-fade to real content at 200ms
```

The skeleton matches the exact shape of the incoming content — matching heights and widths, not generic grey bars — so the transition from loading to loaded feels seamless.

### Quaternary — staggered card entry (Stripe-style)

Used for: risk flag cards appearing after Stage 2 analysis completes.

```
Each card:      translateY(12px) opacity 0 → translateY(0) opacity 1
Duration:       240ms per card
Easing:         cubic-bezier(0.4, 0, 0.2, 1)
Stagger:        40ms between each card
```

### Stage navigator pill

The active indicator behind the pill nav slides between items — it does not jump:

```
Indicator:      background pill slides left/right to new active item
Duration:       200ms
Easing:         cubic-bezier(0.4, 0, 0.2, 1)
```

### Motion tokens reference

```css
--dur-fast:        200ms;   /* pill nav, risk highlight */
--dur-base:        300ms;   /* panel spring collapse */
--dur-page:        380ms;   /* stage transitions */
--dur-card:        240ms;   /* card entry */
--dur-skeleton:    1200ms;  /* AI shimmer loop */

--ease-standard:   cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-out:        cubic-bezier(0, 0, 0.2, 1);
```

### Motion rules

- Never animate idle state. Motion only answers a user action.
- `prefers-reduced-motion: reduce` disables all transitions and animations — content appears instantly.
- No parallax, no scroll-triggered animations on the main workspace — the document pane must feel stable and readable.
- Skeleton shimmer is the only looping animation in the product.

---

## 6. Component library

### Stage navigator pill

A sticky pill bar at the top of the right pane. Always visible. Slides with the page — never disappears on scroll.

```
┌─────────────────────────────────────────────────────────────┐
│  ● 1&2 Understand  │  3 Compare  │  4 Act  │  5 Prepare    │
└─────────────────────────────────────────────────────────────┘
Active state: slate-900 background, white text, rounded pill slides under active item
Inactive:     text-secondary, transparent background
Height:       36px total pill bar, 28px inner pill
```

### Document pane

Fixed, sticky left column. Never scrolls with the right pane. Never moves during stage transitions.

```
Width:              50% on desktop (≥1280px), 100% collapsed on mobile
Background:         --warm-white (#FFFBF0)
Border-right:       0.5px solid var(--border)
Padding:            24px 32px
Font:               Inter 14px / 1.7 + JetBrains Mono for clause refs
Highlight layer:    absolutely positioned coloured underlines/backgrounds per risk
Switcher tab:       top of pane when 2+ documents, Inter 12px pills
```

### Common field card

Persistent top section of the right pane. Collapses to a single-line summary on scroll.

```
Sections:
  ├── "What this document is" — 2 sentence plain English description
  ├── "What's standard for this type in [State]" — 3–5 bullet points
  ├── "Commonly missing in this document type" — 2–3 bullet points
  └── "Where you are" — current stage context blurb

Collapsed state (on scroll past 60px):
  Single line: "Rental agreement · Telangana norms · 3 standards missing"
  Click to expand
```

### Risk flag pill

Used inline in the document pane and as standalone cards in the right pane.

```
Anatomy:
  [severity dot] [category icon] [short label]  [clause ref]

Example:
  ● ⚠ Deviation from norm   §4.2 Notice period

Sizes:
  Inline (document pane):   12px, 20px height pill
  Card (right pane):        14px body, 48px min height card with expand
```

### AI output card

Distinct visual treatment for all GenAI-generated content. Never looks the same as static informational content.

```
Left border:        2px solid --saffron-600
Background:         --saffron-100 at 40% opacity
Header badge:       "AI prepared · not legal advice"
                    Background: --saffron-100, Text: #92400E, 11px, pill shape
Body text:          14px Inter 400, --text-primary
Footer:             "Bring this to your vakil to verify" in 12px --text-muted
```

### Action item (Stage 4)

```
Anatomy:
  [numbered circle] [action text] [source doc tag] [deadline chip]

States:
  Pending:    Saffron outline circle
  Done:       Slate filled circle, checkmark

Example:
  ① Send written notice to landlord   [Rental agreement]   [Within 7 days]
```

### Language selector

Landing page only. Full-screen overlay with 9 language options in a 3×3 grid. Each option shows the language name in that script plus transliteration.

```
Grid item example:
  తెలుగు
  Telugu

Selected state: slate-900 background, white text
Persisted: localStorage key 'vakil-lang', loaded on every subsequent visit
```

### Buttons

| Variant | Background | Border | Text | Use |
|---|---|---|---|---|
| Primary | `--slate-900` | none | white | One per view max |
| Secondary | transparent | `--slate-900` 1px | `--slate-900` | Alternate actions |
| Saffron CTA | `--saffron-600` | none | white | Landing page only |
| Ghost | transparent | none | `--text-secondary` | Non-critical exits |
| Destructive | transparent | `#E53E3E` | `#E53E3E` | Danger actions |

---

## 7. User workflow — full UX map

```
LANDING
│
├── Language selection (full-screen 3×3 grid)
│   └── Persisted to localStorage
│
├── Entry point selection
│   ├── A. Upload document(s)
│   │   ├── Drag-drop zone or file picker
│   │   ├── Accepts: PDF, JPG, PNG (Gemini Vision for images)
│   │   ├── Max: 4 documents per session
│   │   └── File validation: type + size (10MB max) + magic byte check
│   │
│   ├── B. Ask a question (free text)
│   │   ├── Google NLP intent detection
│   │   └── Routes to correct domain + entry stage
│   │
│   └── C. Browse by topic
│       ├── Rental · Employment · Freelancer
│       ├── Property · Consumer · Family
│       └── Routes to domain-specific common field baseline
│
├── [AI routing layer — not visible to user]
│   ├── Transformers.js: document type classification
│   ├── If image: Gemini Vision OCR → text extraction
│   ├── If PDF: PDF.js text extraction
│   └── Domain + state detected → correct baseline loaded
│
└── MAIN WORKSPACE
    │
    ├── [LEFT PANE — fixed throughout]
    │   ├── Document rendered in full
    │   ├── Colour-coded risk highlights (inline)
    │   ├── Click highlight → right pane jumps to explanation
    │   └── Multi-doc: switcher tab at top
    │
    └── [RIGHT PANE — scrollable, stage navigator sticky at top]
        │
        ├── COMMON FIELD (persistent top section)
        │   ├── What this document is
        │   ├── State-specific norms baseline
        │   ├── Commonly missing clauses
        │   └── Where you are in this process
        │
        ├── STAGE 1+2 — Understand & Flag
        │   ├── Plain-language breakdown (Gemini, user's language)
        │   ├── Risk cards (Grok 3 Mini analysis)
        │   ├── Severity × category encoding
        │   └── "AI prepared · not legal advice" badge on all output
        │
        ├── STAGE 3 — Compare
        │   ├── Single doc: vs state-specific standard baseline (DB lookup)
        │   └── Multi-doc: cross-document inconsistency detection (Grok)
        │       ├── Direct contradiction flags
        │       ├── Deviation from norm flags
        │       ├── Coverage gap flags
        │       └── Ambiguous wording flags
        │
        ├── STAGE 4 — Act
        │   ├── Unified action list (no fork)
        │   ├── Items tagged with source doc
        │   ├── Cross-doc items surfaced separately
        │   ├── Indian legal forum routing (rule-based DB)
        │   └── Government portal links by state
        │
        └── STAGE 5 — Prepare (opt-in button)
            ├── Attorney briefing sheet (Gemini generation)
            ├── Optional: draft document generation
            ├── PDF export for both (pdf-lib, client-side)
            └── Framing: "Prepared document — verify with your vakil"
```

---

## 8. Screen-by-screen layout spec

### Screen 1 — Landing

```
┌─────────────────────────────────────────────────────────────┐
│  Vakil AI                                    [भाषा चुनें ▾] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         Understand before you sign.                         │
│         Prepare before you meet your vakil.                 │
│                                                             │
│    ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│    │  Upload doc  │  │  Ask a       │  │  Browse by     │  │
│    │              │  │  question    │  │  topic         │  │
│    │  PDF / photo │  │  "My landlord│  │  Rental        │  │
│    │  drag & drop │  │  won't..."   │  │  Employment    │  │
│    └──────────────┘  └──────────────┘  │  Freelancer    │  │
│                                        │  Property      │  │
│                                        └────────────────┘  │
│                                                             │
│    Not legal advice. Helps you prepare for your vakil.     │
└─────────────────────────────────────────────────────────────┘
```

### Screen 2 — Language selection overlay

```
┌─────────────────────────────────────────────────────────────┐
│                   Choose your language                      │
│                                                             │
│    ┌─────────┐    ┌─────────┐    ┌─────────┐               │
│    │ English │    │  हिन्दी  │    │ తెలుగు  │               │
│    │         │    │  Hindi  │    │ Telugu  │               │
│    └─────────┘    └─────────┘    └─────────┘               │
│    ┌─────────┐    ┌─────────┐    ┌─────────┐               │
│    │ தமிழ்   │    │ ಕನ್ನಡ   │    │ മലയാളം │               │
│    │  Tamil  │    │ Kannada │    │Malayalam│               │
│    └─────────┘    └─────────┘    └─────────┘               │
│    ┌─────────┐    ┌─────────┐    ┌─────────┐               │
│    │ বাংলা   │    │ ગુજરાતી │    │ ਪੰਜਾਬੀ  │               │
│    │ Bengali │    │Gujarati │    │ Punjabi │               │
│    └─────────┘    └─────────┘    └─────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Screen 3 — Main workspace (Stage 1+2, single doc)

```
┌────────────────────────────────────────────────────────────────────┐
│  Vakil AI   [Rental agreement · Telangana]          [EN ▾]  [···] │
├─────────────────────────────┬──────────────────────────────────────┤
│  DOC: rental_agreement.pdf  │  ● 1&2 Understand │ 3 │ 4 │ 5      │
│  [← prev doc] [next doc →]  ├──────────────────────────────────────┤
│                             │  COMMON FIELD                        │
│  This Agreement is made     │  Rental agreement · Telangana norms  │
│  and entered into on...     │  ▸ Standard deposit: 2 months rent   │
│                             │  ▸ Notice period: 30 days minimum    │
│  ████████████████████████   │  ▸ Entry with 24hr notice expected   │
│  [CRITICAL] Clause 4.2 ──── ┼──→ ▸ 3 items missing in this doc    │
│  The landlord may enter     │                                      │
│  the premises at any time   ├──────────────────────────────────────┤
│  without notice.            │  STAGE 1+2 · Understanding           │
│                             │  ┌────────────────────────────────┐  │
│  ████████████████           │  │ ● AI prepared · not legal      │  │
│  [HIGH] Clause 7.1 ─────── ┼──→│   advice                       │  │
│  Security deposit of        │  │                                │  │
│  ₹1,20,000 (6 months)      │  │  This clause lets your landlord│  │
│                             │  │  enter your home without       │  │
│  ████████████████████████   │  │  warning. In Telangana, 24hr   │  │
│                             │  │  notice is the expected norm.  │  │
│                             │  │  Bring this up before signing. │  │
│                             │  │                                │  │
│                             │  │  Bring this to your vakil to   │  │
│                             │  │  verify ↗                      │  │
│                             │  └────────────────────────────────┘  │
├─────────────────────────────┴──────────────────────────────────────┤
│  2 critical · 1 high · 1 medium · Telangana · English             │
└────────────────────────────────────────────────────────────────────┘
```

### Screen 4 — Stage 3 (multi-doc compare view)

```
┌────────────────────────────────────────────────────────────────────┐
│  Vakil AI   [2 docs loaded]                         [EN ▾]  [···] │
├────────────────┬───────────────┬───────────────────────────────────┤
│  Doc 1: Lease  │  Doc 2: NDA   │  1&2 │ ● 3 Compare │ 4 │ 5      │
├────────────────┴───────────────┼───────────────────────────────────┤
│  ... lease text ...            │  COMPARE · 4 issues found        │
│                                │                                   │
│  ██ [CRITICAL] Clause 3.1 ────┼→  ↔ Direct contradiction         │
│  Notice: 30 days              │  ┌────────────────────────────── ┐ │
│                                │  │ Doc 1 says 30-day notice.   │ │
│  ... NDA text ...             │  │ Doc 2 §8 says 60-day notice  │ │
│                                │  │ for the same obligation.     │ │
│  ██ [HIGH] §8 Notice ─────────┼→ └────────────────────────────── ┘ │
│  Notice: 60 days              │                                   │
│                                │  ○ Coverage gap                  │
│                                │  ┌─────────────────────────────┐ │
│                                │  │ Doc 2 requires IP assignment│ │
│                                │  │ Doc 1 is silent on this.    │ │
│                                │  └─────────────────────────────┘ │
└────────────────────────────────┴───────────────────────────────────┘
```

### Screen 5 — Stage 4 + 5 (scrolled down)

```
┌────────────────────────────────────────────────────────────────────┐
│  Vakil AI   [Rental agreement]                      [EN ▾]  [···] │
├─────────────────────────────┬──────────────────────────────────────┤
│  [doc pane — minimised but  │  1&2 │ 3 │ ● 4 Act │ 5             │
│   still sticky left]        ├──────────────────────────────────────┤
│                             │  WHAT TO DO                          │
│  ▾ [tap to expand]          │                                      │
│                             │  ① Send written notice to landlord  │
│                             │     Within 7 days · [Rental agr.]   │
│                             │     Via: Registered post + WhatsApp  │
│                             │                                      │
│                             │  ② If unresolved → file complaint   │
│                             │     District Consumer Forum,         │
│                             │     Hyderabad · hyderabad.ncdrdc.in  │
│                             │                                      │
│                             │  ③ Gather evidence first            │
│                             │     Photos · Payment receipts ·      │
│                             │     Original signed agreement        │
│                             ├──────────────────────────────────────┤
│                             │  STAGE 5 · Prepare for your vakil   │
│                             │                                      │
│                             │  [Generate attorney briefing]        │
│                             │  [Generate draft demand notice]      │
│                             │                                      │
│                             │  ↓ PDF export available after        │
│                             │    generation                        │
└─────────────────────────────┴──────────────────────────────────────┘
```

---

## 9. Stage pipeline detail

### Stage 1+2 — Understand & Flag

**AI used:** Gemini 2.0 Flash (Stage 1 explanation) + Grok 3 Mini (Stage 2 risk analysis)

**Inputs:** Extracted document text (PDF.js or Gemini Vision), detected document type, detected state/jurisdiction, selected language

**Outputs:**
- Plain-language section-by-section breakdown in user's language
- Risk flag cards, severity × category encoded
- Inline document highlights

**Loading state:** Skeleton shimmer matching exact layout of output cards

**Indian-law specifics surfaced:**
- Void non-competes under Section 27, Indian Contract Act
- State-specific deposit norms (2 months in Telangana, 3 in Maharashtra etc.)
- 24-hour notice expectations under standard rental practice
- TDS obligations for freelancers above ₹30,000 per contract
- BNS (Bharatiya Nyaya Sanhita) references where applicable

### Stage 3 — Compare

**AI used:** Grok 3 Mini (inconsistency reasoning)
**Rule-based:** Indian clause baseline database (state-specific, document-type-specific)

**Single-doc mode:** Document compared against structured baseline DB for that document type + state. Deviations surfaced as "deviation from norm" flags.

**Multi-doc mode:** Cross-document analysis. All 4 inconsistency types detected and categorised. Left pane splits to show docs side by side (up to 2), switcher tab for 3+.

### Stage 4 — Act

**AI used:** None
**Rule-based:** Action templates by document type + domain. Forum routing by state DB. Portal links hardcoded.

**Output structure per item:**
```
[number] [action text]
  Source: [document tag]
  When: [deadline or trigger]
  Where: [specific Indian legal forum + URL if applicable]
  Evidence needed: [if applicable]
```

**Cross-doc items** — actions that arise from the interaction between two documents (not from either alone) — are surfaced in a separate "Cross-document actions" section above the per-doc list.

### Stage 5 — Prepare

**AI used:** Gemini 2.0 Flash (briefing sheet + document generation)

**Triggered by:** Explicit opt-in button — never automatic

**Attorney briefing sheet includes:**
- One-paragraph document summary
- Numbered list of concerns to raise, in priority order
- Questions to ask the lawyer (generated from the risk flags found)
- "What you need to bring" checklist (evidence, IDs, original docs)
- AI disclaimer block at top and bottom of document

**Draft document includes:**
- Best-effort legal document draft (demand notice, complaint letter, etc.)
- Prominent framing: "Starting point only — have your vakil review this"
- Blank fields clearly marked where user must fill in their own details

**PDF export:** Client-side via pdf-lib. Slate header bar, Vakil AI branding, AI prepared disclaimer stamped on every page.

---

## 10. Risk encoding system

### Severity levels

```
CRITICAL  ● Red     #E53E3E
          Used for: direct contradiction between documents, clauses void
                    under Indian law (Section 27 non-compete etc.), 
                    clauses that create immediate legal jeopardy

HIGH      ● Amber   #D97706
          Used for: significant deviation from state-specific norms,
                    unusual financial terms, one-sided penalty clauses

MEDIUM    ● Blue    #2E6DA4
          Used for: coverage gaps, missing standard protections,
                    clauses that are unusual but not immediately harmful

LOW       ● Green   #16A34A
          Used for: ambiguous wording, minor deviations, things worth
                    asking about but unlikely to cause harm
```

### Category encoding

Category is always encoded via icon, never via a second colour:

```
↔  Direct contradiction   (arrows-exchange icon)
⚠  Deviation from norm    (alert-triangle icon)  
○  Coverage gap           (circle-dashed icon)
?  Ambiguous wording      (question-mark icon)
```

### Combined encoding examples

```
● ↔  Critical contradiction     Red dot + exchange icon
● ⚠  Critical deviation         Red dot + triangle icon
● ⚠  High deviation             Amber dot + triangle icon
○ ○  Medium coverage gap        Blue dot + dashed circle
● ?  Low ambiguity              Green dot + question mark
```

### Inline document highlight colours

```
Critical:  red underline, 2px, solid
High:      amber underline, 2px, solid
Medium:    blue underline, 1px, solid
Low:       green underline, 1px, dashed
```

### Accessibility rule

Colour is never the only encoding. Every risk indicator includes:
1. Colour dot
2. Category icon
3. Text label ("Critical · Direct contradiction")
4. ARIA label on the highlight element

---

## 11. Multi-document behaviour

### Document switcher

When 2+ documents are uploaded, a tab row appears at the top of the left pane:

```
┌─────────────────────────────────────────────┐
│  rental_agreement.pdf  │  nda_freelance.pdf  │
└─────────────────────────────────────────────┘
```

- Active tab: slate-900 background, white text
- Inactive tab: text-secondary, border-bottom only
- Switching tabs: left pane content slides laterally (same motion token as stage transitions), right pane explanation updates simultaneously

### Per-stage behaviour with multiple docs

| Stage | Multi-doc behaviour |
|---|---|
| Common field | Updates when doc type changes between docs — stays static if same type |
| Stage 1+2 | Right pane explanation updates to reflect active doc |
| Stage 3 | Left pane splits (2 docs) or uses switcher (3+). Right pane shows cross-doc inconsistencies |
| Stage 4 | Unified action list. Items tagged [Doc 1] / [Doc 2]. Cross-doc items in separate section |
| Stage 5 | Briefing sheet covers all loaded documents. One combined PDF |

### Maximum document limit

4 documents per session. On attempt to add a 5th, a toast message appears:

> "4 documents is the maximum per session. Remove one to add another."

---

## 12. Accessibility & i18n

### Accessibility requirements

- WCAG 2.1 AA compliance minimum
- Full keyboard navigation through all stages, all interactive elements
- Tab order follows visual reading order (left pane → stage navigator → right pane)
- ARIA labels on every highlighted clause in the document pane
- Focus ring: `0 0 0 2px --saffron-600` (saffron focus ring is distinct and recognisable)
- Risk colour highlights paired with icon + text — never colour alone
- Screen reader announcement on stage transition: `aria-live="polite"` region announces new stage name
- `prefers-reduced-motion` disables all transitions — content appears instantly

### Internationalisation

- Language persisted to `localStorage` key `vakil-lang`
- All UI strings in `next-intl` translation files — one per language
- Document pane renders original document as-is (English) — AI explanation in right pane appears in selected language
- Stage navigator labels translated
- Risk labels and action items generated by AI in selected language
- Attorney briefing sheet and draft document generated in selected language
- PDF export uses correct Unicode font embedding for regional scripts
- Text direction: all 9 supported languages are LTR — no RTL handling required

### Regional font loading

```css
@import url('https://fonts.googleapis.com/css2?
  family=Inter:wght@400;500;700&
  family=Noto+Sans:wght@400;500&
  family=Noto+Sans+Telugu:wght@400;500&
  family=Noto+Sans+Devanagari:wght@400;500&
  family=Noto+Sans+Tamil:wght@400;500&
  family=JetBrains+Mono:wght@400&
  display=swap');
```

Font family applied per language via `lang` attribute set on `<html>` at language selection:

```css
:lang(te) { font-family: 'Noto Sans Telugu', sans-serif; }
:lang(hi) { font-family: 'Noto Sans Devanagari', sans-serif; }
:lang(ta) { font-family: 'Noto Sans Tamil', sans-serif; }
/* etc. */
```

---

## 13. GenAI touch points in the UI

Every point where GenAI output appears is visually distinguished. This is not just a disclaimer — it is a design system rule.

### AI output visual treatment

```
Left border:    2px solid --saffron-600
Background:     --saffron-100 at 40% opacity
Top badge:      "AI prepared · not legal advice"
                (saffron-100 background, #92400E text, 11px pill)
Footer note:    "Bring this to your vakil to verify"
                (12px, --text-muted, italic)
```

### Where AI is used (visible to user)

| Location | Model | Visual treatment |
|---|---|---|
| Stage 1 explanation | Gemini 2.0 Flash | AI output card |
| Stage 2 risk analysis | Grok 3 Mini | Risk cards with AI badge |
| Stage 3 cross-doc inconsistencies | Grok 3 Mini | Inconsistency cards with AI badge |
| Stage 5 briefing sheet | Gemini 2.0 Flash | Full AI treatment, disclaimer header and footer |
| Stage 5 draft document | Gemini 2.0 Flash | "Starting point only" banner, AI treatment |

### Where AI is not used (no AI badge, no saffron border)

| Location | What handles it |
|---|---|
| Document type detection | Transformers.js classifier |
| Document text extraction | PDF.js (rule-based) |
| Date / deadline extraction | Rule-based regex parser |
| Stage 3 single-doc baseline comparison | Indian clause DB lookup |
| Stage 4 action list | Rule-based templates + forum DB |
| Stage 4 government portal links | Hardcoded by state + domain |
| Language routing | LocalStorage + state management |
| PDF generation | pdf-lib (client-side) |

---

## 14. Design decisions log

A record of non-obvious choices made and why, for evaluator reference.

| Decision | Chosen | Rejected | Reason |
|---|---|---|---|
| Palette | Slate + saffron | Navy + amber | Saffron is culturally Indian without being cliché. Slate is softer than navy. |
| Stage transition | Lateral slide | Fade / wipe | Lateral slide encodes direction of progress — forward/back is legible without labels. |
| Stage 4 structure | Unified action list | Checklist / Simulation fork | Simpler = less cognitive load for target user. Fork felt like unnecessary decision-making at the point of maximum information. |
| Stage 5 trigger | Opt-in button | Automatic | Forces the user to make a conscious choice to receive AI-generated documents. Reduces over-reliance. |
| AI framing | Design-level visual treatment | Footer disclaimer only | Disclaimer-only framing is invisible. Saffron border + badge is impossible to miss. |
| Doc pane position | Fixed left, never moves | Scrolls with right pane | Document must always be available for reference during all stages. |
| Right pane behaviour | Scrollable with sticky navigator | Multiple tabs / subpages | Continuous scroll with sticky nav solves both continuity and navigability without a URL change per stage. |
| Multi-doc limit | 4 documents | Unlimited | Beyond 4, layout degrades. 4 covers the realistic use case (lease + NDA + offer letter + insurance). |
| Inconsistency taxonomy | 4 types (contradiction / deviation / gap / ambiguity) | Binary "flag / no flag" | 4 types map directly to how lawyers actually categorise document review findings. Evaluators who read the problem statement carefully will recognise these. |
| Font choice | Inter + Noto Sans | System UI | System UI varies per device, breaking regional script rendering. Noto Sans guarantees consistent Telugu/Hindi/Tamil rendering across all devices. |
| Saffron CTA usage | Landing page + AI badge only | Throughout as accent | Restricting saffron to one UI role gives it semantic weight. Overuse dilutes meaning. |

---

*Vakil AI · Design Document v1.0*
*Built for PromptWars Virtual · AI for Legal Assistance & Access*
*"Understand before you sign. Prepare before you meet your vakil."*
