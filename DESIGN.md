---
name: Apex Pitch
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1b1b1d'
  surface-container: '#1f2021'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#343536'
  on-surface: '#e4e2e3'
  on-surface-variant: '#c4c6cc'
  inverse-surface: '#e4e2e3'
  inverse-on-surface: '#303032'
  outline: '#8e9196'
  outline-variant: '#44474c'
  surface-tint: '#bac8dd'
  primary: '#bac8dd'
  on-primary: '#243142'
  primary-container: '#000b1a'
  on-primary-container: '#6d7b8e'
  inverse-primary: '#525f72'
  secondary: '#ffffff'
  on-secondary: '#283500'
  secondary-container: '#c3f400'
  on-secondary-container: '#556d00'
  tertiary: '#c6c6c7'
  on-tertiary: '#2f3131'
  tertiary-container: '#090b0b'
  on-tertiary-container: '#787a7a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d5e4f9'
  primary-fixed-dim: '#bac8dd'
  on-primary-fixed: '#0e1c2c'
  on-primary-fixed-variant: '#3a4859'
  secondary-fixed: '#c3f400'
  secondary-fixed-dim: '#abd600'
  on-secondary-fixed: '#161e00'
  on-secondary-fixed-variant: '#3c4d00'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131315'
  on-background: '#e4e2e3'
  surface-variant: '#343536'
typography:
  display-lg:
    fontFamily: Anton
    fontSize: 96px
    fontWeight: '400'
    lineHeight: 90px
    letterSpacing: 0.02em
  headline-xl:
    fontFamily: Anton
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 60px
    letterSpacing: 0.02em
  headline-xl-mobile:
    fontFamily: Anton
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 44px
  headline-lg:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
  body-lg:
    fontFamily: Archivo Narrow
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Archivo Narrow
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Archivo Narrow
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  stats-number:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  section-gap: 64px
---

## Brand & Style

This design system embodies the high-stakes energy of the FIFA World Cup 2026. The brand personality is "Premium Athletic"—a fusion of elite sports performance and cutting-edge technology. It is designed for a global audience that demands immediacy, precision, and immersive viewing experiences.

The visual style is a hybrid of **High-Contrast / Bold** and **Glassmorphism**. Massive, authoritative typography provides the structural backbone, while translucent, frosted-glass overlays for scores, stats, and navigation menus inject a sense of futuristic depth. The UI must evoke a "stadium under the lights" atmosphere: dark, focused, and electrically charged. Motion is a core tenet; interactions should feel kinetic, utilizing directional swipes and fast-paced transitions to mirror the speed of the game.

## Colors

The palette is optimized for high-impact visibility and a premium dark-mode experience.
- **Primary (Deep Navy):** The foundation of the UI, providing a sophisticated, low-light environment that makes live video pop.
- **Secondary (Vibrant Lime):** A high-visibility "pitch green" used exclusively for calls to action, live indicators, and critical highlights.
- **Tertiary (Crisp White):** Reserved for primary headers and high-priority text to ensure maximum readability against dark backgrounds.
- **Accent (Glass Surface):** A slightly lighter navy used for container backgrounds and hover states to create subtle tonal layering.

## Typography

Typography is used as a graphic element. **Anton** brings a commanding, condensed presence for headlines and scores, echoing traditional sports broadcast graphics. **Archivo Narrow** ensures that data-heavy sections—like player stats and league tables—remain legible and efficient without sacrificing the athletic aesthetic.

Large display type should often use italicization or slight tracking adjustments to imply forward motion. Labels and secondary metadata should utilize all-caps styling to maintain a disciplined, institutional feel.

## Layout & Spacing

The layout follows a **Fluid Grid** model with high-density information clusters. 
- **Desktop:** A 12-column grid with wide 48px margins to allow the video content to breathe. 
- **Mobile:** A 4-column grid where content is stacked vertically, prioritizing a "Video-First" view where the top 40% of the screen is dedicated to the live stream or highlights.

Spacing is tight (8px increments) within data components to maximize information density, while larger gaps (64px+) are used between sections to define clear content boundaries. Side navigation is preferred on desktop to keep the vertical axis clear for scrolling through live match updates.

## Elevation & Depth

This design system avoids traditional drop shadows in favor of **Glassmorphism** and **Tonal Layers**. 
- **The Pitch Layer:** The base level (Deep Navy) is solid and opaque.
- **The Glass Layer:** Floating UI elements like score overlays, player cards, and navigation bars use a semi-transparent background (20-40% opacity) with a high-intensity backdrop blur (20px-40px). 
- **Active Edge:** To define depth without shadows, use 1px semi-transparent white top-borders or "inner glows" on glass elements to simulate light hitting the edge of a physical lens.

## Shapes

The shape language is aggressive and architectural. A **Soft (0.25rem)** roundedness is used for most containers to maintain a serious, professional tone while preventing the UI from feeling dated or "boxy." 

Small accents, like "Live" badges or active tab indicators, should use sharp 0px corners to heighten the sense of precision. Interactive elements like buttons should retain the slight 0.25rem radius to ensure they feel tactile and modern.

## Components

- **Primary Buttons:** High-contrast Secondary (Lime) background with black text. Use heavy weight and all-caps. No shadows; use a subtle "shimmer" animation on hover.
- **Scoreboard Cards:** Glassmorphic surfaces with a 1px border. Home and Away teams are separated by a high-contrast vertical divider.
- **Live Indicators:** A sharp-edged rectangular badge in Secondary (Lime) with "LIVE" in black text, accompanied by a pulsing dot.
- **Data Chips:** Small, semi-transparent dark grey backgrounds with white text, used for tags like "Group A" or "Full Time."
- **Input Fields:** Dark background with a 1px white border at 20% opacity. Upon focus, the border turns Secondary (Lime) with a subtle outer glow.
- **Player Stats Lists:** Use Zebra-striping with Tonal Layers (alternating between Primary and Accent colors) for high readability during fast scrolling.
- **Progress Bars (Match Timeline):** Use the Secondary color for the "played" portion and a low-opacity white for the "remaining" portion, with key match events (goals, cards) marked by sharp vertical pips.