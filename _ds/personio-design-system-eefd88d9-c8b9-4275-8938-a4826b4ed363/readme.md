# Personio Design System

## Overview

**Personio** is the Intelligent HR Platform for small and mid-sized businesses across Europe. Its mission — "Reimagine human matters" — positions Personio as more than a utility: an experience that puts people at the centre of business, moving past "human resources" toward a future where human potential is realised.

**Tagline:** The Intelligent HR Platform

**Brand philosophy (from the brand foundations):** "Our long-term ambition is to turn Personio from a utility into an experience. Rosetta Stone is a utility; Duolingo is an experience."

This system is **brand-first**. Its primary use is brand work — presentations, marketing material, brand assets, visual communication. The product/UI library that governs the live web app has its own standards; `ui_kits/web-app/` here is a high-fidelity reference recreation, not that library.

## Surfaces represented

1. **Presentations / decks** — the official Personio 2.0 deck template (July 2025 GA v5, 91 source slides). The primary surface. See `brand/Personio Deck Template.html` (44 layouts) and `slides/` (12 layout cards).
2. **Personio web app** — the HR platform: people, recruiting, time off, payroll. See `ui_kits/web-app/`.

## Sources

Everything here was built from material supplied by the user. None of it was reconstructed from memory.

- **Mounted codebase:** `Personio Brand System [WIP]/` — a prior work-in-progress brand system containing the font files, logo SVGs, colour/type CSS, the built deck template, foundation preview cards, and a web-app prototype. This project is its cleaned-up, compiler-conformant successor.
- **Figma (referenced by that WIP, not re-read here):** *Brand Foundations Guidelines (Copy).fig* — 264 frames covering colour, typography, tone and voice, logomark, illustration, texture, photography, layout and product UI guidelines. The reader is assumed not to have access; recorded in case they do.
- **Deck source:** `sources/00_Personio Deck Template.pdf` — the exported Google Slides template the deck layouts were traced from.
- **Fonts:** `fonts/FTRegolaNeue-*.woff2` + `FTRegolaNeue-Variable.ttf` (supplied).
- **Logos:** `assets/logomark.svg` (wordmark), `assets/mark.svg` (mark only).
- **Reference screenshots:** `sources/deck-cover.png`, `sources/deck-check.png`.

---

## CONTENT FUNDAMENTALS

### Voice pillars
- **Insightful** — shares knowledge and perspective with confidence; illuminates rather than describes.
- **Interconnected** — treats people, teams and businesses as linked; speaks to shared outcomes.
- **Expertise** — deep understanding of HR and business; credible without jargon.
- **Adaptability** — tone flexes by context. Product UI is direct and calm; marketing is more expressive.

### Tone
Voice is constant, tone adapts. Before writing, ask: Who are you talking to? What are they trying to do? Where are they coming from? What state of mind are they in? What promises are we making?

### Writing style
- **Casing:** sentence case everywhere — headlines, buttons, labels, nav, table headers. Never title case.
- **Person:** "we" for the company, "you" for the reader. "We serve people, not processes."
- **Punctuation:** em dashes (—) used liberally for rhythm. Exclamation marks essentially absent.
- **Emoji:** never, in brand copy or product UI.
- **Length:** concise. The brand's own guidance quotes Baldwin: "Don't describe a purple sunset, make me see that it is purple."
- **Numbers and lists:** numbered lists, never bullet points (an explicit deck rule).
- **Blank rather than invented:** where a surface has no source, it says so instead of being filled.

### Examples
- Headline: *"Personio offers a new path — serve people, not processes."*
- Positioning line: *"Not your filing cabinet or your fire department. We're a suite of proactive solutions that grow your business."*
- Product greeting: *"Good morning, Maria"* / *"Here's what needs your attention today."*
- Switch label: *"Notifications on"* — describes state, not action.

### Messaging territory
Reimagine human matters · The Intelligent HR Platform · Serve people, not processes · From utility to experience · Where people are valued and their true potential is realised.

---

## VISUAL FOUNDATIONS

### Colour
Colours are "approachable, confident, and grounded. They never shout for attention." In product the palette steps back for content; in marketing it is more expressive but always balanced against neutrals and white space. Every family runs a 10→95 ramp, where 10 is a tint surface, 50 is the saturated brand step, and 80–95 are text and deep grounds.

**Core:** Lavender (primary — 50 is `#A533CC`), Flame (`#FF3700`), Fog (warm pinkish neutral), Water (teal), Sky (blue), Grey (`#141414` at 95).
**Extended, for illustration and expressive moments:** Berry, Terracotta, Marigold, Forest.

Rules of thumb: Lavender 50 is the only interactive colour in product. Flame appears as 2px accent rules and inside gradients, not as a fill. A deck uses at most two background colours beyond white. Functional states borrow from the palette — Forest for success, Marigold for warning, Flame for error, Sky for info — never a generic green/red.

### Typography
**FT Regola Neue** (Formula Type, Piero Di Biase) is the typeface for everything: a geometric grotesque with warmth and strong form that works at display and text sizes. Weights 300–800 with true italics; a variable file is included.

- Display and slide titles: Heavy 800 at 96–160px, line-height 0.95, tracking −0.04em. Section numerals go to 720px.
- H1 700 / 64px / 0.85 / −0.03em · H2 700 / 44px · H3 500 / 32px · H4 500 / 24px.
- Body large 400 / 28px / 36px · body 500 / 18px · body small 500 / 16px · label 500 / 14px · micro 500 / 12px · eyebrow 500 / 10px uppercase / 0.06em.
- **Inter Tight** Regular is the one exception: small body copy inside deck content cards. **Inter** is used in dense product data tables. **Lab Grotesque Mono** is named for code/data — the file was not supplied (see Caveats).
- Tracking tightens as size grows; it is never positive except on the uppercase eyebrow.

### Backgrounds and surfaces
White is the default. `#F5F5F4` is the warm off-white that carries most product UI. Tinted grounds are Lavender 10, Water 10, and Fog light `#E9E2E5`. Dark grounds are `#262626` and `#141414`. "Sunset Bloom" — Lavender 90 `#320F3D` under a blurred Flame→Lavender radial bloom — is the signature brand ground for covers and section dividers.

Backgrounds are **flat colour plus texture**, not gradients-as-decoration. The texture is a 14px radial halftone dot grid at `mix-blend-mode: multiply`, 40% opacity, layered over the colour; on dark grounds it switches to `screen`. Blurred radial "blooms" (400–1200px circles, `filter: blur(40–80px)`, opacity 0.25–0.7) sit under the halftone. Deck section dividers are called **garden plots** and rotate ground colour across sections for rhythm.

### Imagery
Warm, natural light. Diverse casting. Documentary and candid over posed; action over portrait. The grade is warm and natural — not oversaturated, not black-and-white, no heavy grain. Illustration is textural and abstract: halftone dots, organic blobs, soft gradients — never flat icon-style vector scenes. The guidelines include principles for authentic, non-clichéd AI-generated photography. **No photography or illustration files were supplied**, so image areas in the deck layouts are left as marked placeholders.

### Spacing and layout
4px base step, tokens `--space-1` (4px) → `--space-20` (80px). Page margin 80px; slide margin **72px** with the logo pinned at top 56px / left 72px and the date and slide number pinned at bottom 40px — identical on every slide. 12 columns, 16px gutter.

### Corner radii
4px small, 7px controls, 8px dense product cards, 16px, 24–30px marketing and brand panels, 9999px pills. Avatars are fully round.

### Cards
Product cards are white with either a 1px `#E2E2E1` hairline (dense table views) or the four-stop diffuse shadow — `0 0.272px 2.129px rgba(0,0,0,.014)`, `0 0.751px 5.885px rgba(0,0,0,.02)`, `0 1.809px 14.169px rgba(0,0,0,.026)`, `0 6px 47px rgba(0,0,0,.04)`. Tinted and dark cards are always **flat** — never tint plus shadow. Brand/marketing cards are 24px-radius flat colour blocks with no border.

### Shadows, transparency and blur
Three elevations (`--shadow-sm` diffuse four-stop, `--shadow-md`, `--shadow-lg`) plus a focus ring of 3px Lavender at 12%. Transparency is used for hierarchy on dark grounds — white at 85% for body, 60% for subheads, 50% for slide meta, 6–9% for panel fills. Blur has two jobs only: the gradient blooms, and `backdrop-filter: blur(100px)` on floating glass panels such as the AI input. No frosted chrome elsewhere, no protection gradients over imagery — dark overlays are used instead on full-bleed image slides.

### Borders
Hairlines are `#E2E2E1`, or `#F0F0EF` for in-card row separators. On dark grounds, `rgba(255,255,255,0.06)`. Borders are structural, never decorative; there is no coloured left-border accent pattern anywhere in this brand.

### Motion
The guidelines define no formal motion system. Observed behaviour: short, functional transitions — 120–200ms on `cubic-bezier(0.4,0,0.2,1)`, applied to background and border colour. Fades and colour changes only; no bounce, no spring, no scale-in entrances, no scroll-triggered animation.

### Hover and press
Hover on a filled control darkens the fill one step (Lavender 50 → 60). Hover on a secondary control lifts the background to `#F0F0EF`. Table and list rows hover to `#F5F5F4`. Dark-ground nav rows hover to white at 5%. Press states are **not** expressed by shrinking or scaling — feedback is colour only. Focus is the 3px Lavender ring with a Lavender border.

---

## ICONOGRAPHY

Personio ships a **proprietary stroke-based icon set** at 20×20 and 16×16 (several thousand instances across the Figma brand file). The style is clean, geometric and minimal, one consistent stroke weight, drawn in brand colours or neutrals. Fills are avoided except for a few solid glyphs (star, filter, sparkle).

**No icon files were supplied with the source material.** `components/core/Icon.jsx` therefore ships a **substitute set in Lucide's shape language** — same stroke-first geometry, 24-unit grid, 1.8 stroke weight, rendered at 16px in controls and table rows and 20px in nav. ⚠️ **This is a flagged substitution.** If the real Personio icon SVGs or icon font can be supplied, drop them into `assets/icons/` and swap the `PATHS` map in `Icon.jsx`.

Other rules: no emoji, ever (the WIP prototype had one in a greeting — removed). No unicode characters standing in for icons, with two deliberate exceptions carried over from the source: the ↑/↓ arrows in KPI deltas and the typographic quote mark on quote slides. The chevron affordance on a select is a real icon, not a `▾`.

---

## Components

Compiler-registered React primitives. The inventory is exactly what the source material defines (the WIP preview cards and prototype) — nothing speculative has been added.

**`components/core/`**
- `Icon` — stroke line icon, 25 glyphs (`ICON_NAMES`)
- `Button` — primary / secondary / ghost / dark / danger, 3 sizes, pill, icons
- `Badge` — status badge, 6 tones, optional dot
- `Tag` — classification pill, 6 palette tones
- `Avatar`, `AvatarStack` — tinted initials or photo, overlapping stack with "+n"
- `Card` — surface in white / subtle / accent / teal / dark
- `KpiCard` — single-metric stat card with signed delta

**`components/forms/`**
- `Field` — shared label / hint / error wrapper
- `Input` — text input with focus and error states
- `Select` — native dropdown with chevron
- `Textarea` — multi-line notes field
- `Switch` — 36×20 toggle

### Intentional additions
- **`Icon`** — the source has an icon *set*, not an icon *component*. A wrapper was needed so consumers get consistent sizing and stroke weight.
- **`Field`** — extracted from the repeated label/error markup in the source form card so `Input`, `Select` and `Textarea` stay consistent.
- **`Tag`** vs **`Badge`** — the source card showed "status badges" and "pill tags" as separate treatments; they are separate components here.

---

## Index

```
/
├── readme.md                     ← this file
├── SKILL.md                      ← agent skill definition
├── styles.css                    ← global entry (imports only)
├── thumbnail.html                ← homepage tile
├── tokens/
│   ├── fonts.css                 ← @font-face (FT Regola Neue) + Inter/Inter Tight
│   ├── colors.css                ← core + extended ramps, semantic aliases
│   ├── typography.css            ← families, weights, type scale
│   ├── spacing.css               ← space scale, radii, layout margins
│   ├── elevation.css             ← shadows, blur, easing, durations
│   └── base.css                  ← reset, semantic type classes, .halftone
├── assets/
│   ├── logomark.svg              ← wordmark
│   └── mark.svg                  ← mark only
├── fonts/                        ← FT Regola Neue woff2 (12 cuts) + variable ttf
├── guidelines/                   ← 22 foundation specimen cards (Colors, Type, Spacing, Brand)
├── components/
│   ├── core/                     ← Icon, Button, Badge, Tag, Avatar, Card, KpiCard
│   └── forms/                    ← Field, Input, Select, Textarea, Switch
├── slides/                       ← 12 deck layout cards (group "Slides")
├── brand/
│   ├── Personio Deck Template.html   ← full 44-layout deck, arrow-key navigable
│   └── deck-stage.js
├── templates/personio-deck/      ← reusable 10-slide deck template (Design Component)
├── ui_kits/web-app/              ← HR Platform click-through recreation
└── sources/                      ← supplied deck PDF and reference screenshots
```

---

## Caveats

- **Lab Grotesque Mono is not supplied.** `--font-mono` names it and falls back to JetBrains Mono / system mono. No substitute has been baked in.
- **Icons are substituted** (Lucide shape language) — see ICONOGRAPHY.
- **No photography or illustration assets** were supplied. Image areas are honest placeholders; nothing was drawn or generated.
- The Figma brand file was not re-read in this project; its contents are recorded second-hand from the WIP system built against it.
