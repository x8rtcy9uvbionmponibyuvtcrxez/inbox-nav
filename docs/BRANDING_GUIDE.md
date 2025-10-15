# Inbox Navigator Brand System

This guide defines the visual language for Inbox Navigator. Use it as the single source of truth when designing or developing any new UI surface.

## Core Principles
- **Calm command.** Dark surfaces with soft contrast that feel premium without sacrificing legibility.
- **Efficient clarity.** Every element should communicate hierarchy through typography, spacing, or color―never through decoration alone.
- **Consistent motion.** Interactions should feel responsive and confident with subtle transitions (150 ms–200 ms) applied consistently.

## Typography
| Style | Usage | Font weight | Size / Line-height | Letter-spacing | Color token |
| --- | --- | --- | --- | --- | --- |
| Display | Landing hero headlines | 700 | 48 px / 110% | -0.02 em | `--text-primary` |
| H1 | Page titles (`h1`) | 600 | 36 px / 115% | -0.015 em | `--text-primary` |
| H2 | Section titles (`h2`) | 600 | 28 px / 120% | -0.01 em | `--text-primary` |
| H3 | Card headers (`h3`) | 600 | 22 px / 125% | -0.005 em | `--text-primary` |
| Body L | Lead copy | 400 | 18 px / 150% | 0 | `--text-secondary` |
| Body M | Default paragraph | 400 | 16 px / 155% | 0 | `--text-secondary` |
| Body S | Helper text, captions | 500 | 14 px / 150% | 0.01 em | `--text-muted` |
| Micro | Labels, chips | 600 | 12 px / 140% | 0.16 em | `--text-muted-strong` |

- **Primary font:** Geist (Google). Fallback: `ui-sans-serif`, `system-ui`.
- **Mono font:** Geist Mono for code-like or ID strings.
- All page-level copy should have a maximum width of 68 ch for readability.

## Color System
| Token | Hex | Usage |
| --- | --- | --- |
| `--surface-0` | `#030616` | App background |
| `--surface-1` | `#0B1024` | Cards, panels |
| `--surface-2` | `#131A36` | Elevated cards, menus |
| `--surface-3` | `#1F2954` | Popovers, modals |
| `--border-subtle` | `rgba(255,255,255,0.08)` | Default borders |
| `--border-strong` | `rgba(255,255,255,0.16)` | Emphasised borders |
| `--text-primary` | `rgba(255,255,255,0.96)` | Headlines & primary body text |
| `--text-secondary` | `rgba(228,233,255,0.86)` | Default body text |
| `--text-muted` | `rgba(189,202,255,0.68)` | Hints & helper text |
| `--text-muted-strong` | `rgba(189,202,255,0.78)` | Micro labels, chips |
| `--accent-primary` | `#FFFFFF` | Primary CTAs |
| `--accent-primary-contrast` | `#040714` | Text on primary CTAs |
| `--accent-gradient-from` | `#7468FF` | Decorative gradients (start) |
| `--accent-gradient-to` | `#7ED0FF` | Decorative gradients (end) |
| `--success` | `#4ADE80` | Positive states |
| `--warning` | `#FACC15` | Warning states |
| `--danger` | `#FB7185` | Errors/destructive |

### Backgrounds
- Body uses `--surface-0` with a subtle radial gradient overlay (see `globals.css`).
- Cards layer `--surface-1` with `border: 1px solid var(--border-subtle)` and a 12 px–24 px radius.

## Buttons
| Variant | Visual | Use cases |
| --- | --- | --- |
| `primary` | Solid pill, white background, dark text, soft drop-shadow | Core CTAs (launch, save, proceed) |
| `secondary` | Subtle glass border (`--border-subtle`), translucent background | Neutral actions |
| `outline` | Transparent background, `--border-strong`, text uses `--text-secondary` | Alternative actions, filter toggles |
| `ghost` | No border, text accent, used for inline actions | Text-only interactions |
| `danger` | Solid `--danger` background, white text | Destructive actions |

All buttons:
- Height tokens: `sm` (34 px), `md` (44 px), `lg` (52 px).
- Padding: horizontal `1.25rem` (`sm` uses `0.875rem`).
- Font weight: 600, letter-spacing `0.01 em`.
- Border radius: `9999px` (pill).
- Transition: `all 180ms ease`.

## Layout & Spacing
- Base unit: 4 px.
- Card padding: 24 px (`px-6 py-5`) on desktop, 20 px on mobile.
- Large section spacing: 32 px.
- Page gutters: clamp between 16–56 px.

## Iconography
- Use Heroicons outline at 1.5 px stroke.
- Default icon color: `--text-secondary`.
- Place icons inside circular containers (`bg-white/12`) for cards or inline with 0.5rem gap.

## Elevation
| Level | Shadow |
| --- | --- |
| Card | `0 24px 48px -32px rgba(4, 7, 20, 0.65)` |
| Popover | `0 32px 60px -40px rgba(4, 7, 20, 0.75)` |
| Modal | `0 40px 80px -40px rgba(4, 7, 20, 0.85)` |

## Content Guidelines
- Prefer sentence case on buttons and headings.
- Use consistent terminology for data (e.g., “Inbox inventory”, “Launch summary”).
- Provide helper text when forms require clarification; use Body S style.

## Implementation Checklist
1. Import `Geist` via `next/font` and apply globally (already done).
2. Use the shared `<Button>` component with defined variants for all interactive CTAs.
3. Apply typography utility classes (`text-brand-primary`, etc.) instead of raw opacity-based Tailwind classes.
4. Maintain accessible contrast: target WCAG AA (contrast ≥ 4.5 for body text, ≥ 3.0 for large text).
5. Keep hover & focus states consistent (border brightens, text opacity to 100%, slight translateY `-0.5px` if needed).

Refer to this guide whenever a new surface or component is created. Updates should be reviewed and reflected here to keep the brand cohesive.
