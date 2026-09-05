---
name: Obsidian Kinetic
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#1bbd85'
  on-tertiary-container: '#00452e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-hero:
    fontFamily: geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: geist
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: geist
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-code:
    fontFamily: jetbrainsMono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
  metric-stat:
    fontFamily: jetbrainsMono
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
  gutter-desktop: 1.5rem
  margin-desktop: 2.5rem
  gutter-tablet: 1rem
  margin-tablet: 1.5rem
  gutter-mobile: 0.75rem
  margin-mobile: 1rem
---

## Brand & Style

This design system establishes an ultra-precise, mission-critical workspace engineered for high-stakes enterprise AI evaluations, multi-agent observability, and technical governance. Drawing visual tenets from the refined minimalism of Linear, the infrastructural clarity of Vercel, and the ambient technical poise of OpenAI, the interface communicates forensic reliability, high compute throughput, and real-time intelligence.

The visual direction merges **Technical Minimalism** with **Controlled Glassmorphism**. Dark slate voids provide an expansive, glare-free working foundation. Visual structures rely on translucent surfaces, razor-thin 1px borders with subtle luminosity, and targeted chromatic signals rather than heavy solid elements. The interface should evoke the sensation of operating inside an advanced avionics console or an enterprise AI command node: calm, hyper-legible, frictionless, and definitively modern.

## Colors

The palette is engineered specifically for deep-dark, high-density dashboard architectures. Surfaces are constructed on an ultra-dark navy-slate continuum to prevent visual fatigue while preserving chromatic contrast.

- **Primary (`#06B6D4` - Cyber Cyan):** Denotes primary user action, active evaluation streams, data-routing highlights, and focused inspection targets.
- **Secondary (`#8B5CF6` - Neural Violet):** Signifies multi-agent interaction layers, autonomous arbitration, machine-learning consensus, and orchestration metadata.
- **Tertiary (`#10B981` - Kinetic Emerald):** Communicates passing assessments, verified benchmark thresholds, system health, and production-ready signals.
- **Neutral (`#0F172A` - Deep Void Slate):** Establishes the foundational canvas, paired with `#090D16` for canvas bases and tiered slate overlays (`rgba(255, 255, 255, 0.03)` through `rgba(255, 255, 255, 0.08)`) for frosted layers.

### Functional Tokens
- **Canvas Base:** `#090D16`
- **Surface Elevation 1 (Card/Panel):** `#0F172A` at 65% opacity with 12px backdrop blur.
- **Border Default:** `rgba(255, 255, 255, 0.08)`
- **Border Active/Hover:** `rgba(6, 182, 212, 0.35)`
- **Border Glow:** `0 0 12px rgba(6, 182, 212, 0.15)`
- **Text Primary:** `#F8FAFC`
- **Text Secondary:** `#94A3B8`
- **Text Muted:** `#64748B`
- **Semantic Warning:** `#F59E0B`
- **Semantic Error/Fail:** `#EF4444`

## Typography

The typographic hierarchy balances structural precision with developer-native utility:

- **Headlines (`geist`):** Geometric, ultra-clean neo-grotesque design with tight tracking creates a sharp architectural posture for reporting titles, agent clusters, and evaluation sections.
- **Body (`inter`):** Unobtrusive, highly legible neutral workhorse engineered for complex narrative assessment breakdowns and multi-column telemetry readouts.
- **Telemetry & Metadata (`jetbrainsMono`):** Monospaced type delivers mathematical clarity for latencies, confidence metrics, tokens-per-second, model weights, and JSON audit trees.

All headline elements utilize negative tracking (`-0.01em` to `-0.03em`) to mimic high-end technical publication standards. Sub-labels, table header identifiers, and agent roles must be rendered in `label-caps` with uppercase transformation and tracking expansion.

## Layout & Spacing

The layout model implements a continuous 12-column adaptive grid configured for high-density information displays:

- **Desktop (>= 1280px):** 12 columns with 24px (`space-xl`) gutters and 40px (`margin-desktop`) outer safe padding. Maximum content constraint caps at 1680px for widescreen telemetry displays.
- **Tablet (768px - 1279px):** 8 columns with 16px (`gutter-tablet`) gutters and 24px margins. Timeline panels collapse beside summary metrics.
- **Mobile (< 768px):** 4 columns with 12px (`gutter-mobile`) gutters and 16px margins. Agent consensus graphs and timelines reflow into vertically stacked procedural steps.

Layout composition follows strict 4px/8px modular increments. Dense data rows, token counters, and status badges prioritize vertical compactness (`space-xs` to `space-sm`), while major assessment sections enforce breathable visual segmentation via `space-2xl` and `space-3xl`.

## Elevation & Depth

Visual hierarchy does not rely on opaque stacking or drop shadows. Instead, it employs **translucent depth strata** combined with edge-lit luminescence.

### Elevation Levels
- **Layer 0 (Canvas):** Pure foundational dark `#090D16`. Supports optional subtle radial cyan/violet gradient glows (400px radius, 3% opacity) centered behind priority data hubs.
- **Layer 1 (Card & Module Surfaces):** Semi-transparent `#0F172A` (60–75% opacity) paired with `backdrop-filter: blur(16px)` and a continuous 1px outline of `rgba(255, 255, 255, 0.07)`.
- **Layer 2 (Hovered Cards & Active Panels):** Surface opacity increases to 85%, and the 1px border transitions to `rgba(6, 182, 212, 0.4)` with an ambient cyan glow: `box-shadow: 0 0 20px -4px rgba(6, 182, 212, 0.12)`.
- **Layer 3 (Modals, Overlays, Floating Tooltips):** Background elevated to `#1E293B` at 90% opacity, `backdrop-filter: blur(24px)`, enclosed by `1px solid rgba(255, 255, 255, 0.15)` and an ambient deep drop shadow: `0 24px 48px -12px rgba(0, 0, 0, 0.65)`.

Dividers and interior boundaries are strictly 1px borders tinted to `rgba(255, 255, 255, 0.05)`.

## Shapes

The design system adheres to a sharp, modern geometric discipline (`roundedness: 1`). Radii remain tight to maximize information density and preserve the crisp aesthetic of professional developer equipment.

- **Micro Elements (Chips, Badges, Metrics):** 4px (`rounded-xs` / `0.25rem`).
- **Form Controls & Action Triggers:** 6px (`rounded-sm` / `0.375rem`).
- **Surface Cards & Data Grids:** 8px (`rounded-lg` / `0.5rem`).
- **Modal Windows & Major Shells:** 12px (`rounded-xl` / `0.75rem`).
- **Circular Indicators (Pill Status, Node Avatars):** 9999px strictly reserved for live status indicators, pulse dots, and multi-agent network graph nodes.

## Components

### Buttons
- **Primary:** Gradient-infused fill from `#06B6D4` to `#0891B2`, text `#090D16` in 600 weight, sharp 6px radius, with an inner top highlight `inset 0 1px 0 rgba(255, 255, 255, 0.3)`. Hover triggers a diffused cyan outer glow.
- **Secondary / Ghost:** Transparent background, `1px solid rgba(255, 255, 255, 0.12)`, text `#F8FAFC`. On hover, background shifts to `rgba(255, 255, 255, 0.04)` with border transitioning to `rgba(255, 255, 255, 0.25)`.
- **Destructive:** Bordered in `rgba(239, 68, 68, 0.3)`, text `#EF4444`, hover surface tint `rgba(239, 68, 68, 0.08)`.

### Chips & Score Badges
- **Assessment Chips:** Monospaced evaluation metadata rendered with `height: 22px`, 4px radius, `1px solid rgba(255, 255, 255, 0.08)`, and dark fill. Contains a 6px status dot (emerald for pass, violet for agent deliberation, cyan for verification).
- **Score Badges:** High-contrast composite component displaying numerical output (e.g., `98.4%`) with a subtle gradient backing keyed to performance tiers (Emerald `Tertiary` for high capability, Amber for degraded alignment).

### Input Fields & Controls
- **Inputs:** `#0F172A` background at 80% opacity, 1px border `rgba(255, 255, 255, 0.1)`, `jetbrainsMono` or `inter` font at 13px, placeholder in `#64748B`. Focus states trigger a 1px border of `#06B6D4` alongside an ambient `0 0 0 2px rgba(6, 182, 212, 0.15)` ring.
- **Checkboxes & Radios:** Minimalist square (4px) or circular frames with dark slate fills, transitioning to `#06B6D4` fill with white geometric micro-checks when selected.

### Cards & Data Panels
- All cards utilize the Layer 1 glassmorphism spec. Section headers inside cards feature an integrated 1px bottom divider in `rgba(255, 255, 255, 0.06)` with monospaced tracking labels and inline action shortcuts.

### Multi-Agent Panel Handoff Timeline (Domain-Specific)
- **Handoff Nodes:** Connected along a vertical or horizontal 1px dashed guide-line (`rgba(255, 255, 255, 0.12)`).
- **Agent Avatars:** 28px circular micro-surfaces with distinct model signatures: Primary Cyan for Supervisor/Router agents, Neural Violet for Specialist/Critic agents, and Emerald for Consensus nodes.
- **Transfer State Line:** Active agent-to-agent processing displays a moving linear gradient pulse running through the path vector (`#06B6D4` to `#8B5CF6`).