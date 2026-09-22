# Design Document

> Based on the Feedants Competition Details screen design reference (Objective_Page.png).
> The image shows a mobile app screen (853x1844px) with a dark/navy themed competition page.

---

## Design Principles

1. **Mobile-first** — Designed for React Native, optimized for both iOS and Android
2. **Content hierarchy** — Most critical info (title, status, deadline) is visible above the fold
3. **State-driven UI** — Every interactive element clearly reflects the current competition state
4. **Accessible** — Sufficient color contrast, touch targets ≥ 44x44px, screen reader labels
5. **Feedback-oriented** — Loading states, success/error toasts, button disabled states
6. **Consistent spacing** — 4pt base grid system

---

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Brand Primary | `#6C63FF` | CTA buttons, active states, highlights |
| Brand Secondary | `#FF6584` | Accent, badges, warnings |
| Dark Background | `#0D0D1A` | Screen background |
| Surface | `#1A1A2E` | Cards, modals, sheet backgrounds |
| Surface Elevated | `#252540` | Elevated cards, input backgrounds |

### Text Colors
| Name | Hex | Usage |
|------|-----|-------|
| Text Primary | `#FFFFFF` | Headings, primary text |
| Text Secondary | `#A0A0C0` | Subtitles, secondary labels |
| Text Muted | `#5A5A7A` | Placeholder, disabled text |

### Status Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success | `#00D4A0` | Active/open competitions, success states |
| Warning | `#FFB800` | Upcoming, limited spots warning |
| Error | `#FF4757` | Ended, cancelled, error states |
| Info | `#4ECDC4` | Neutral info badges |

### Gradients
- Hero banner overlay: `linear-gradient(transparent → #0D0D1A)`
- CTA button: `linear-gradient(135deg, #6C63FF → #8B80FF)`
- Progress bar fill: `linear-gradient(90deg, #6C63FF → #FF6584)`

---

## Typography

| Style | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| H1 | System (SF Pro / Roboto) | 28sp | 700 | Screen title |
| H2 | System | 22sp | 700 | Section headings |
| H3 | System | 18sp | 600 | Card titles |
| Body Large | System | 16sp | 400 | Primary body text |
| Body | System | 14sp | 400 | Secondary body, descriptions |
| Caption | System | 12sp | 400 | Labels, timestamps, hints |
| Button | System | 16sp | 600 | Button labels |
| Badge | System | 11sp | 700 | Status badges, tags |

---

## Spacing System

Based on 4pt grid:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

---

## UI Components

### 1. Competition Banner
- Full-width image at top of screen
- Gradient overlay fading to background color at bottom
- Back navigation button (top-left, 44x44px touch target)
- Share button (top-right, optional)

### 2. Status Badge
- Pill-shaped badge below title
- Color-coded by status: green (active), yellow (upcoming), red (ended/full)
- Text: "ACTIVE", "UPCOMING", "FULL", "ENDED", "CANCELLED"
- Small colored dot prefix

### 3. Competition Info Card
- Title (H1)
- Category tag
- Host/organizer row (avatar + name)
- Description (collapsible if long)

### 4. Stats Row
- Horizontal row of 3 stats chips:
  - Participants: current / total
  - Time remaining (countdown or end date)
  - Entry fee (or "FREE")
- Each chip: icon + value + label

### 5. Spots Progress Bar
- Label: "X spots remaining"
- Filled bar showing registered / total ratio
- Color shifts to warning when < 20% spots left

### 6. Countdown Timer
- Large display for upcoming/active competitions
- Format: `DD : HH : MM : SS` with labels
- Updates every second

### 7. Registration CTA Button
- Full-width, bottom of screen (or sticky footer)
- States:
  - **Register** — primary gradient, enabled
  - **Already Registered** — success green, with checkmark icon
  - **Competition Full** — grey, disabled
  - **Ended** — grey, disabled, "Competition Ended"
  - **Upcoming** — amber, disabled, "Opens [date]"
- Loading spinner during API call
- Haptic feedback on press

### 8. Participants Preview Section
- Section heading "Participants"
- Row of small avatar circles (up to 5) + overflow count "+N more"
- Tap to see full list (future screen)

### 9. Rules / Details Section
- Expandable accordion list
- Each rule item: numbered or bulleted
- "View All Rules" link if truncated

### 10. Toast / Snackbar
- Bottom of screen
- Success: green background, checkmark
- Error: red background, X icon
- Auto-dismiss after 3 seconds

---

## Screen Layout (Competition Details)

```
┌─────────────────────────────┐
│  [← Back]    Banner Image   │
│              [Share]        │
│                             │
│  ████ Status Badge ████     │
│                             │
│  Competition Title          │
│  Category • Host Name       │
│                             │
│  ┌──────┬──────┬──────┐    │
│  │ 125  │ 2d 4h│ FREE │    │
│  │Users │ Left │      │    │
│  └──────┴──────┴──────┘    │
│                             │
│  Spots: ██████░░░  80/100  │
│                             │
│  Description text here...   │
│  [Read more]                │
│                             │
│  Rules                      │
│  ▸ Rule 1                   │
│  ▸ Rule 2                   │
│                             │
│  Participants               │
│  😊😊😊😊😊 +120 more       │
│                             │
│  ┌─────────────────────┐   │
│  │    [  REGISTER  ]   │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

---

## Responsive Considerations
- Support screen widths from 320px to 430px (standard phones)
- Safe area insets for notch/punch-hole devices (use `useSafeAreaInsets`)
- Bottom navigation bar clearance on Android
- Dynamic font scaling: respect user's accessibility font size settings
