---
name: Industrial Precision
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
  on-surface-variant: '#bcc9c6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#879391'
  outline-variant: '#3d4947'
  surface-tint: '#6bd8cb'
  primary: '#6bd8cb'
  on-primary: '#003732'
  primary-container: '#29a195'
  on-primary-container: '#00302b'
  inverse-primary: '#006a61'
  secondary: '#ffb690'
  on-secondary: '#552100'
  secondary-container: '#ec6a06'
  on-secondary-container: '#4a1c00'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The brand personality is engineered for high-stakes industrial environments where precision and reliability are paramount. This design system evokes an "Industrial Tech" aesthetic—fusing the rugged dependability of heavy machinery with the sophisticated intelligence of modern AI. It targets operators, engineers, and plant managers who require immediate clarity under pressure.

The visual style is **Corporate Modern** with a **Glassmorphic** layer. It utilizes deep, dark canvases to reduce eye strain in factory environments, punctuated by high-contrast "Safety" accents. Surfaces are structured with subtle translucent layers and precise borders, mimicking a high-end heads-up display (HUD) or an industrial control console.

## Colors

The palette is rooted in a deep slate and charcoal foundation to establish a professional, "software-as-tool" feel. 

- **Primary (Industrial Teal):** Used for main actions, active states, and successful system "pings." It represents the "Go" signal of modern automation.
- **Secondary (Safety Orange):** Reserved for high-priority alerts, warnings, and manual intervention triggers. It mimics industrial safety standards to ensure immediate attention.
- **Success (Emerald):** Specifically for "CONFORME" (Compliant) status indicators.
- **Error (Ruby):** Specifically for "NON-CONFORME" (Non-compliant) status and critical system failures.
- **Surface:** Uses `#0F172A` as the base, with lighter slate variants for card elevations to maintain depth without sacrificing the dark-mode utility.

## Typography

The typography system prioritizes legibility and technical rigor. 

**Inter** is utilized for all UI navigation, headlines, and standard body text. Its neutral, clean architecture ensures that the interface remains unobtrusive and professional.

**JetBrains Mono** is the "Data Voice" of the system. It is used for all technical readouts, timestamps, coordinates, sensor data, and status badges. The monospaced nature of the font ensures that numerical values do not jump visually when updating in real-time, providing a stable viewing experience for monitoring "Scan" and "Analyze" processes.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a 12-column structure for desktop interfaces, allowing data visualizations and camera feeds to expand and fill the screen. 

A strict **8px grid** governs all spacing. This "Industrial Rhythm" ensures that even complex dashboards with multiple data points remain organized and scannable. 
- **Desktop:** 12 columns, 24px gutters, 32px side margins.
- **Tablet:** 8 columns, 16px gutters, 24px side margins.
- **Mobile:** 4 columns, 12px gutters, 16px side margins.

Information density is high to allow operators to see multiple camera feeds and telemetry data simultaneously without excessive scrolling.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Glassmorphism**, avoiding traditional heavy shadows which can feel too "organic" for an industrial tool.

1.  **Base Layer:** Solid `#0F172A`.
2.  **Surface Layer:** Semi-transparent slate (`rgba(30, 41, 59, 0.5)`) with a 12px backdrop blur. This creates a "glass-on-metal" feel.
3.  **Borders:** Instead of shadows, use 1px solid borders (`#334155`) to define element edges. 
4.  **Active Elevation:** When an element is focused or "scanning," apply a subtle outer glow using the Primary Teal color with a low spread (4px) to simulate an illuminated hardware button.

## Shapes

The design system uses a **Soft (Level 1)** roundedness approach. 

Corners are slightly rounded (4px to 12px) to prevent the UI from feeling overly aggressive or dated, but they remain sharp enough to maintain a sense of mathematical precision. This balance reflects the "Software/Engineering" crossover—robust like hardware, but polished like high-end software. 

- **Small elements (Checkboxes, Tags):** 4px.
- **Medium elements (Buttons, Inputs):** 6px.
- **Large elements (Cards, Feed Containers):** 8px.

## Components

### Buttons & Inputs
- **Primary Action (Analyze/Scan):** Industrial Teal background, bold Inter text. On hover, a slight inner glow.
- **Secondary Action:** Ghost style with a 1px teal border.
- **Critical Action:** Safety Orange background, specifically for manual overrides or emergency stops.
- **Text Inputs:** Darker than the surface layer with a subtle 1px border that glows Teal when focused.

### Status Badges
- **CONFORME:** Emerald green background with dark green text (JetBrains Mono).
- **NON-CONFORME:** Ruby red background with white text (JetBrains Mono).
- **SCANNING:** A pulsing Teal border with a monospaced "percentage complete" readout.

### Cards
- Large, data-heavy containers using the glassmorphic style. 
- Headers should include a technical icon (e.g., a camera aperture or a sensor wave) and a timestamp in JetBrains Mono.

### Data Visualizations
- Line charts and histograms should use Teal for the main data path.
- Reference "tolerance" lines should be dashed and rendered in Safety Orange.
- Use thin, high-contrast grid lines to reinforce the industrial grid aesthetic.