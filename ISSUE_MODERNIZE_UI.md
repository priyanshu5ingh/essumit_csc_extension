# Modernize UI/UX Across All Frontends

## Overview

The project currently has **3 separate React frontends** (extension side panel, desktop app, monitoring dashboard) plus a legacy vanilla JS panel — each with its own theme, styling approach, and component copies. The UI needs a comprehensive modernization to look professional, consistent, and modern.

## Current Issues

### 1. Inconsistent Theming
- Extension uses a custom CSC saffron/green/navy theme
- Desktop app uses a generic shadcn `oklch()` theme  
- Dashboard uses another generic shadcn theme
- No shared design tokens between the three

### 2. Massive Component Duplication
- All ~48 shadcn/ui components (`button.tsx`, `card.tsx`, `input.tsx`, etc.) are copy-pasted identically across all 3 React apps
- This wastes space, makes updates painful, and increases bundle sizes

### 3. Legacy Code Still Present
- `panel.html` / `panel.js` / `styles.css` (1287 lines) — legacy vanilla JS side panel coexists with the React version
- Root-level `.js` files (`aiAssistant.js`, `extractionService.js`, etc.) may be outdated

### 4. No Dark Mode in Extension
- Desktop and dashboard have dark mode CSS variables, but the extension theme.css does not

### 5. No Centralized i18n
- Bilingual (Hindi/English) support is handled ad-hoc per component rather than through a proper i18n system

### 6. Accessibility Gaps
- No systematic focus on ARIA labels, contrast ratios, or keyboard navigation

### 7. Different Font Stacks
- Extension: Inter + Noto Sans Devanagari + JetBrains Mono
- Desktop: Baloo 2 + Noto Sans + Noto Sans Devanagari + Roboto Mono
- Dashboard: Inter + Noto Sans Devanagari
- Results in inconsistent visual appearance

### 8. Animation Inconsistency
- Extension uses `tw-animate-css`
- Desktop uses inline CSS animations
- FileTract uses custom keyframes

## Proposed Changes

### Phase 1: Design System Foundation
- [ ] Create a shared `@csc/design-system` package (or workspace) with:
  - Unified design tokens (colors, typography, spacing, shadows)
  - Consistent CSS custom properties across all apps
  - Shared Tailwind CSS v4 theme configuration
  - Dark mode support for all frontends
- [ ] Standardize on one font stack (recommend: Inter + Noto Sans Devanagari)
- [ ] Define a single animation utility/token set

### Phase 2: Component Library
- [ ] Extract all shared shadcn/ui Radix components into a common package
- [ ] Build app-specific components on top of the shared library
- [ ] Create a living style guide / Storybook for visual reference

### Phase 3: Visual Overhaul
- [ ] Redesign the extension side panel with:
  - Cleaner card layouts with better spacing
  - Smooth micro-interactions and transitions
  - Improved progress stepper
  - Better bilingual layout
- [ ] Redesign the desktop login page with:
  - Refined Ashok Chakra animation
  - More polished government header/footer
  - Professional gradient treatments
- [ ] Redesign the monitoring dashboard with:
  - Modern card-based analytics widgets
  - Better data visualization styling
  - Consistent filter/search patterns
- [ ] Modernize the legacy `panel.html` or replace it entirely

### Phase 4: Code Quality
- [ ] Remove or archive legacy vanilla JS files once React equivalents are confirmed working
- [ ] Clean up unused dependencies
- [ ] Implement centralized i18n with react-i18next or similar
- [ ] Audit and improve accessibility (WCAG 2.1 AA target)
- [ ] Add proper TypeScript strict mode across all apps

### Phase 5: UX Improvements
- [ ] Add responsive design for the desktop app
- [ ] Improve loading states with skeleton screens
- [ ] Better error states and empty states
- [ ] Toast notifications system (already partially there with Sonner)
- [ ] Consistent form validation UX

## Screenshots
*(Attach current UI screenshots here)*

## Tech Stack
- React 18 + TypeScript
- Tailwind CSS 4 + CSS Custom Properties
- Radix UI + shadcn/ui components
- Vite 6
- Framer Motion / tw-animate-css for animations
- Lucide icons
- Recharts (dashboard/desktop)

## Acceptance Criteria
- [ ] All 3 React apps share the same visual design language
- [ ] Dark mode works in the extension
- [ ] All legacy CSS/JS is removed or archived
- [ ] Consistent bilingual support
- [ ] No visual regressions in existing functionality
- [ ] Bundle size is reduced (not increased)
