---
name: Luxury Editorial
colors:
  surface: '#151312'
  surface-dim: '#151312'
  surface-bright: '#3b3937'
  surface-container-lowest: '#100e0d'
  surface-container-low: '#1d1b1a'
  surface-container: '#211f1e'
  surface-container-high: '#2c2928'
  surface-container-highest: '#373433'
  on-surface: '#e7e1df'
  on-surface-variant: '#d1c5b4'
  inverse-surface: '#e7e1df'
  inverse-on-surface: '#32302f'
  outline: '#9a8f80'
  outline-variant: '#4e4639'
  surface-tint: '#e9c176'
  primary: '#e9c176'
  on-primary: '#412d00'
  primary-container: '#c5a059'
  on-primary-container: '#4e3700'
  inverse-primary: '#775a19'
  secondary: '#d7c3b5'
  on-secondary: '#3a2e24'
  secondary-container: '#54463c'
  on-secondary-container: '#c8b5a7'
  tertiary: '#c6c6c6'
  on-tertiary: '#2f3131'
  tertiary-container: '#a5a5a5'
  on-tertiary-container: '#393b3b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdea5'
  primary-fixed-dim: '#e9c176'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4201'
  secondary-fixed: '#f4dfd0'
  secondary-fixed-dim: '#d7c3b5'
  on-secondary-fixed: '#241911'
  on-secondary-fixed-variant: '#52443a'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#151312'
  on-background: '#e7e1df'
  surface-variant: '#373433'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 72px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '400'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '300'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.15em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  margin-desktop: 80px
  margin-mobile: 20px
  gutter: 32px
  section-padding: 120px
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The visual identity of the design system is rooted in the "New Luxury" aesthetic—combining the timeless elegance of high-end editorial magazines with modern digital minimalism. It is designed to evoke a sense of serenity, exclusivity, and meticulous craftsmanship. 

The style utilizes a **Minimalist** foundation layered with **Glassmorphism** for functional elements. The interface prioritizes negative space (white space) to allow high-quality imagery and sophisticated typography to breathe. Subtle marble textures and metallic gold accents are used sparingly to reinforce a tactile, premium feel without cluttering the user experience.

## Colors

This design system employs a sophisticated, warm-toned palette that mimics natural materials like brass, stone, and earth.

- **Primary (Gold/Brass):** Reserved for key calls to action, active states, and delicate accents that guide the eye.
- **Secondary (Warm Taupe):** Used for supporting UI elements, borders, and subtle backgrounds to create a softer contrast than pure greys.
- **Neutral (Ebony & Bone):** The background utilizes a deep, warm charcoal (#1A1817) to provide a rich canvas for the gold and white elements. For light-mode surfaces, a "Bone" white is preferred over pure white to maintain the organic, premium feel.
- **Functional Accents:** Success and error states should be muted to fit the palette—think sage greens and terracotta reds rather than vibrant neons.

## Typography

The typography strategy relies on a high-contrast pairing between a classic serif and a precision-engineered sans-serif.

- **Headlines:** `Playfair Display` is the centerpiece. Use it for hero sections and major headers. The low-weight (300/400) and tight letter-spacing create a high-fashion, editorial look.
- **Body & Navigation:** `Hanken Grotesk` provides a clean, contemporary counter-balance. Its geometric clarity ensures legibility across dense information while feeling modern.
- **Micro-copy & Eyebrows:** Small caps with generous letter spacing (0.15em+) should be used for labels, navigation items, and "eyebrow" text above headings to establish hierarchy.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop (max-width: 1440px) to maintain the integrity of the editorial compositions, transitioning to a fluid model for smaller viewports.

- **The 12-Column System:** On desktop, use a 12-column grid with wide 32px gutters. Elements should often be offset to create asymmetrical, dynamic layouts.
- **Vertical Rhythm:** Use large vertical spacing (`section-padding`) between content blocks to create a "gallery" feel, preventing the user from feeling overwhelmed.
- **Whitespace:** Never crowd the content. If a component feels "busy," increase the internal padding and external margins.

## Elevation & Depth

Depth is communicated through material honesty and atmospheric layers rather than heavy drop shadows.

- **Glassmorphism:** Secondary floating elements (like info cards or tooltips) should use a backdrop-blur (20px+) with a semi-transparent background (White @ 10% or Neutral @ 20%).
- **Tonal Layering:** Hierarchy is established by placing lighter-toned containers on darker backgrounds. 
- **Soft Glows:** Gold elements may occasionally feature a very soft, diffused outer glow (match primary color at 15% opacity) to simulate the reflection of light on metallic surfaces.
- **Borders:** Use thin (1px), low-contrast borders (Secondary color at 30% opacity) for cards and dividers to maintain structure without breaking the visual flow.

## Shapes

The shape language is defined by soft, organic curves that contrast with the rigid grid of the layout.

- **Pill Shapes:** Primary and secondary buttons always use a full pill radius to evoke a "friendly but polished" feel.
- **Containers:** Large cards and glassmorphic overlays use `rounded-xl` (1.5rem / 24px) to soften the UI.
- **Image Treatment:** Photography should either be perfectly rectangular for an editorial look or feature large-radius organic corners (e.g., arch shapes) to mimic high-end interior architecture.

## Components

### Buttons
- **Primary:** Pill-shaped, solid Bone White or Gold background with dark text. No shadow; use a subtle scale-up effect on hover.
- **Secondary:** Pill-shaped, thin 1px gold border, transparent background. Text in Gold or White.
- **Tertiary:** Text-only with a 1px underline that expands from the center on hover.

### Cards & Containers
- **Content Cards:** Minimalist with no background fill. Use typography and spacing to define the area. 
- **Interactive Cards:** Use the glassmorphic style (backdrop-blur) with a thin gold border on hover to indicate interactivity.

### Form Inputs
- **Style:** Underline-only or very subtle filled inputs. Avoid heavy boxes. Labels should always use the `label-caps` typography style.
- **Focus State:** The underline transitions from Secondary Taupe to Primary Gold.

### Navigation
- **Top Bar:** Transparent or semi-transparent glassmorphic blur. Navigation links use `label-caps` with a focus on generous horizontal spacing.