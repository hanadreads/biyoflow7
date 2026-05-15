# BiyoFlow Design Brief

## Visual Direction
Utilitarian operational dashboard for water tanker drivers + USSD-style customer ordering flow. Practical clarity over decoration. Mobile-first, high-contrast, status-driven UI.

## Tone
No-nonsense, practical, field-worker friendly. Clear visual feedback for order state. Somali-language compatible.

## Differentiation
Status color coding is immediate: operators see order state at a glance. Two distinct visual modes—customer (text-step flow) vs driver (card-based operational dashboard).

## Color Palette
| Token | OKLCH | Usage |
|-------|-------|-------|
| Primary (Blue) | 0.55 0.18 260 | Pending orders, navigation |
| Secondary (Amber) | 0.75 0.2 80 | Accepted, active selection |
| Accent (Orange) | 0.65 0.22 40 | En route, urgent status |
| Success (Green) | 0.65 0.22 120 | Completed orders |
| Warning (Purple) | 0.55 0.22 280 | Pumping, in-progress |
| Destructive (Red) | 0.55 0.22 25 | Exception, help flagged |
| Neutral | 0.99 / 0.12 | Light/dark backgrounds |

## Typography
- **Display/Body**: GeneralSans 400 (clean, readable, Somali-friendly)
- **Mono/Accent**: GeistMono 400 (phone numbers, order IDs, technical data)
- **Scale**: 12px (caption) → 14px (body) → 16px (heading) → 18px (step title) → 20px (page title)

## Elevation & Depth
Minimal shadows, card-based structure on driver dashboard. Customer flow uses border-bottom dividers instead of cards. Single background tone with 1–2 secondary tints for sections.

## Structural Zones
| Zone | Treatment |
|------|----------|
| Header | bg-card, border-b, lang toggle (English/Somali) |
| Content | bg-background, cards/steps with high contrast |
| Footer | bg-muted/20, border-t, minimal metadata |
| Modals | bg-card, ring-primary for focus |
| Status Badges | Color-coded, full-width or inline |

## Spacing & Rhythm
- **Mobile**: 16px container padding, 12px gap between items
- **Density**: High on driver app (cards stacked), loose on customer flow (step-by-step)
- **Whitespace**: Breathing room around status badges, compact in lists

## Component Patterns
- **Buttons**: Primary (blue), Secondary (muted), Destructive (red), full-width on mobile
- **Inputs**: High-contrast border, min 44px touch target, monospace for phone/order ID
- **Status Badges**: Color-coded, semantic text (pending, accepted, en_route, pumping, completed, exception)
- **Cards**: Minimal elevation, clear border or shadow-light, full-width stack on mobile

## Motion
Smooth transitions (0.3s) on interactive elements: hover states, toggle switch, status changes. No bounce or playful animations—keep it professional.

## Constraints
- No bootstrap/default Tailwind colors—all colors OKLCH-defined
- No arbitrary classes—semantic Tailwind utilities only
- Mobile-first design, single-column on mobile, 2-column max on tablet
- Somali text support built-in (font choice verified)
- No external images except placeholder assets

## Signature Detail
Status color badges appear in every relevant section—customer sees their order color immediately on load, driver sees incoming order color before opening. This color-first design lets operators work intuitively even under field stress.
