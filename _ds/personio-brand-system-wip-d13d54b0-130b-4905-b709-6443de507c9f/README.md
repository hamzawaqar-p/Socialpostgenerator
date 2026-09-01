# Personio Design System

## Overview

**Personio** is the Intelligent HR Platform for small and mid-sized businesses across Europe. Their mission, called "Reimagine human matters," positions Personio as more than a utility — it's an experience that puts people at the center of business, moving beyond the traditional notion of "human resources" toward a future where human potential is fully realized.

**Tagline:** The Intelligent HR Platform

**Brand philosophy:** "Our long-term ambition is to turn Personio from a utility into an experience. Rosetta Stone is a utility; Duolingo is an experience."

---

## Sources

- **Figma:** Brand Foundations Guidelines (Copy).fig — mounted as virtual FS at `/WIP-Personio-GA-Guidelines-2026/` (264 frames covering color, typography, tone & voice, logomark, illustration, texture, photography, layout, and product UI guidelines)
- **Fonts:** `fonts/FTRegolaNeue-Variable.ttf` — FT Regola Neue Variable (uploaded)
- **Logos:** `assets/logomark.svg`, `assets/mark.svg`

---

## Focus

This design system is **brand-first**. Its primary use case is brand work: presentations, marketing materials, brand assets, and visual communication. A separate product/UI library governs the Personio web app with its own standards.

## Surfaces

1. **Presentations / Decks** — Internal and external Google Slides template (91 slides). Primary surface this DS targets. See `Personio Deck Template.html`.
2. **Marketing Website** — Acquisition and brand, uses expressive color + imagery.
3. **Personio Web App** — Separate product library. `ui_kits/web-app/` is a reference prototype only.

---

## CONTENT FUNDAMENTALS

### Voice pillars
Personio's voice is defined by four high-level pillars:
- **Insightful** — Shares knowledge and perspective with confidence; doesn't just describe, it illuminates.
- **Interconnected** — Recognizes that people, teams, and businesses are linked; speaks to shared outcomes.
- **Expertise** — Demonstrates deep understanding of HR and business; credible without being jargon-heavy.
- **Adaptability** — Flexible tone depending on context — product UI is direct and calm; marketing is more expressive.

### Tone
Tone adapts by context; voice stays consistent. Before writing, ask:
- Who are you talking to?
- What are they trying to do?
- Where are they coming from?
- What state of mind are they in?
- What promises are we making?

### Writing style
- **Casing:** Sentence case everywhere. Headlines, buttons, labels — all sentence case.
- **Person:** First person plural ("we"), second person ("you") for direct address. "We serve people, not processes."
- **Punctuation:** Em dashes (—) used liberally for rhythm. Minimal exclamation marks.
- **Tone:** Grounded, confident, human. Never shouts. Approachable but authoritative.
- **Emoji:** Not used in brand copy or product UI.
- **Length:** Concise. "Don't describe a purple sunset, make me see that it is purple." (James Baldwin)
- **Example headline:** *"Personio offers a new path — serve people, not processes."*
- **Example tagline:** *"Not your filing cabinet or your fire department. We're a suite of proactive solutions that grow your business."*

### Key messaging territory
- Reimagine human matters
- The Intelligent HR Platform
- Serve people, not processes
- From utility to experience
- Where people are valued and their true potential is realized

---

## VISUAL FOUNDATIONS

### Color system
Colors are "approachable, confident, and grounded. They never shout for attention." In product, palette steps back for content. In marketing, more expressive but always balanced with neutrals and white space.

**Core Palette (brand backbone):**

| Name | 10 | 50 (mid) | 90/95 |
|------|-----|----------|-------|
| Lavender | #EDD6F5 | #A533CC ← **primary brand** | #1A0821 |
| Flame | #FFD6CC | #FF3700 | #290900 |
| Fog | #DCD0D6 | #9C7889 | #1D1619 |
| Water | #D5F4F6 | #40CFD3 | #09282A |
| Sky | #A1BCF7 | #1359EC | #061B47 |
| Grey | #E6E6E5 | #808080 | #141414 |

**Extended Palette (for illustration, iconography, expressive moments):**

| Name | 10 | 50 | 90/95 |
|------|-----|-----|-------|
| Berry | #FBD0E7 | #E64D9F | #2F041B |
| Terracotta | #F5DCD6 | #CD593C | #29100A |
| Marigold | #FFEACC | #FF9500 | #291800 |
| Forest | #D6F5E4 | #33CC7B | #082113 |

**Semantic / UI Colors:**
- `--color-bg` : #FFFFFF
- `--color-surface` : #F5F5F4 (warm off-white, most common UI surface)
- `--color-surface-dark` : #262626
- `--color-fg` : #141414
- `--color-fg-secondary` : #737370
- `--color-border` : #E2E2E1
- `--color-accent` : #A533CC (Lavender 50)
- `--color-accent-dark` : #8821AB (Lavender 60)
- `--color-teal` : #11494B (Water 80 — used in typography section BG)
- `--color-fog-light` : #E9E2E5

### Typography

**Primary typeface:** FT Regola Neue — geo-grotesque sans-serif by Piero Di Biase / Formula Type. Characterized by warmth, strong form, and grotesque detail that works for both text and display. Variable font available.

**Weights in use:** Bold (700) → headlines, Semibold (600) → subtitles, Medium (500) → body/labels, Regular (400) → long-form body.

**Scale:**
| Role | Weight | Size | Line Height | Letter Spacing |
|------|--------|------|-------------|---------------|
| Display | Bold | 128px | 130px | -3px |
| H1 | Bold | 64px | 0.85 | -0.03em |
| H2 | Bold/Semibold | 44px | 1.0 | -0.02em |
| H3 | Semibold | 32px | 40px | -1.28px |
| H4 | Medium | 24px | 1.2 | -0.02em |
| Body Large | Regular | 28px | 36px | -0.6px |
| Body | Medium | 18–20px | 1.3 | -0.01em |
| Body Small | Medium | 16px | 20px | 0 |
| Label/Eyebrow | Medium | 14–16px | 20px | 0 |
| Micro | Medium | 12px | — | — |

**Alternate web font:** Inter (used in product UI components, system-level text). Lab Grotesque Mono for code/data display.

### Backgrounds & Surfaces
- Primary BG: White (`#FFFFFF`)
- Card/surface: `#F5F5F4` (warm neutral)
- Dark surface: `#262626` or `#141414`
- Tinted surfaces: Lavender light (`#EDD6F5`), Water light (`#D5F4F6`), Fog light (`#E9E2E5`)
- No aggressive gradients in product; gradients used in marketing/illustration ("gradients to excite")
- Texture: halftone patterns, soft blur circles, organic shapes layered with `mix-blend-mode: soft-light`

### Spacing & Layout
- Grid: 80px outer margins, 16px column gutter
- Corner radius: 8px (product cards), 24–30px (larger panels, guideline frames)
- Consistent 12px gap between panel elements, 32px between sections

### Cards & Panels
- Rounded corners: 8px (tight), 24–30px (loose/marketing)
- Glassmorphism in product: `backdrop-filter: blur(100px)`, subtle white shadow insets
- Shadow system: multi-layer (`0px 0.272px 2.129px rgba(0,0,0,0.014)`, `0px 0.751px 5.885px rgba(0,0,0,0.02)`, `0px 1.809px 14.169px rgba(0,0,0,0.026)`, `0px 6px 47px rgba(0,0,0,0.04)`)
- No harsh borders — subtle `rgba` separators or background color differentiation

### Animation & Motion
- No explicit animation system defined in guidelines. Transitions appear to be: smooth, minimal, fade-based.
- Product uses `backdrop-filter` blur for floating panels (AI input, overlays)

### Hover / Press States
- Hover: Color darkening (Lavender 50 → 60), opacity reduction
- Press: Slight shrink not documented; color-based feedback

### Imagery
- **Photography:** Warm, natural lighting. Diverse casting. Documentary/candid style. Action shots over posed.
- **Color grade:** Warm, natural — not overly saturated, not B&W. Organic, human.
- **Illustrations:** Textural, abstract — halftone dots, organic blobs, soft gradients. Never flat icon-style illustrations.
- **AI imagery:** Guided principles for authentic, non-clichéd AI photography

---

## ICONOGRAPHY

Personio uses a proprietary icon set (20×20 and 16×16 SVG icons, ~4000+ instances in Figma). The icon style is:
- **Stroke-based line icons** at 20×20 and 16×16 sizes
- Clean, geometric, minimal — consistent stroke weight
- Typically rendered in brand colors or neutrals

**Assets available:** `assets/logomark.svg`, `assets/mark.svg`

**CDN substitute:** [Lucide Icons](https://lucide.dev) (same stroke-weight, clean geometric style) is the closest open match and is used in UI kit components as a substitute.

**No emoji** in brand or product UI.

---

## DECK TEMPLATE

### Source
`Personio Deck Template.html` — built from the official Google Slides template (July 2025 GA v5, 91 slides). Navigate with ←/→ keys.

### Slide layouts (15 included)
| # | Layout | Background |
|---|---------|-----------|
| 1 | Cover | White |
| 2 | Cover | Dark (#141414) |
| 3 | Cover | Lavender (#EDD6F5) |
| 4 | Cover | Sunset Bloom (deep purple + flame) |
| 5 | Agenda | White, 2-column numbered list |
| 6 | Section opener 01 | Dark |
| 7 | Stats / KPI | White, 3 large numbers |
| 8 | Body text | White, left label + right copy |
| 9 | Quote | Lavender, decorative quote mark |
| 10 | Bold statement | Dark, full-width heavy text |
| 11 | Four-card grid | White, Inter Tight body |
| 12 | Product feature | White, feature list + UI placeholder |
| 13 | Section opener 02 | Teal (#D5F4F6) |
| 14 | Image / visual | White, image placeholder |
| 15 | Thank you | Dark with lavender glow |

### Deck rules (from official template)
- **No bullet points** — use numbered lists or clean paragraphs
- **Sentence case** everywhere
- **Font sizes**: do not change outside defaults
- **Colors**: stick to pre-set Personio 2.0 palette only
- **Text limits**: title = 2 lines, headline = 1 line, body = 2–3 lines per block
- **Inter Tight Regular** for small card body text (inside content boxes)
- **FT Regola Neue** for all headlines, titles, stats, quotes
- White background for text-heavy slides
- "Garden plots" (section openers) alternate background colors for rhythm

### Named themes
- **Sunset Bloom** — deep purple (#320F3D) + warm flame gradient. Used for cover/section openers.
- **Water** — teal (#D5F4F6). Used for second section openers.
- **Dark** — #141414. Used for bold statements, thank you, premium topics.
- **White/Neutral** — default for body content slides.

---

## File Index

```
/
├── README.md                    ← You are here
├── SKILL.md                     ← Agent skill definition
├── colors_and_type.css          ← All CSS custom properties
├── fonts/
│   └── FTRegolaNeue-Variable.ttf
├── assets/
│   ├── logomark.svg             ← Personio wordmark + mark
│   └── mark.svg                 ← Personio mark only
├── preview/                     ← Design System tab cards
│   ├── colors-core.html
│   ├── colors-extended.html
│   ├── colors-semantic.html
│   ├── type-scale.html
│   ├── type-weights.html
│   ├── spacing-tokens.html
│   ├── shadow-system.html
│   ├── brand-logo.html
│   ├── brand-voice.html
│   └── components-buttons.html
└── ui_kits/
    └── web-app/
        ├── README.md
        ├── index.html           ← HR Platform prototype
        └── components/
```
