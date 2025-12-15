# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Produtive ads is a Next.js application for managing digital product affiliate marketing. Built with the App Router, React 19, TypeScript, and Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 16.0.6 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **Icons**: Lucide React
- **Fonts**: STIX Two Text (serif) and Acumin Pro (sans-serif) - custom fonts loaded via next/font/local
- **Theme**: next-themes for dark mode support

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Application Structure

### Routes
- `/` - Home dashboard with stats, tutorials, and quick tips
- `/login` - Authentication page with traditional and magic link login
- `/product-finder` - HubFinder: Main product discovery and filtering interface
- `/ads-analytics` - HubAds: Ads performance analytics
- `/ranking-hub` - HubRanking: Product rankings and market trends
- `/page-builder` - HubPage: Landing page builder
- `/campaign-wizard` - HubCampaign: Campaign automation wizard
- `/pixel-tracker` - HubPixel: Pixel tracking management

### Core Components (`/app/components`)
- `sidebar.tsx` - Fixed sidebar navigation with all app modules
- `sidebar-layout.tsx` - Sidebar state management (expanded/collapsed)
- `main-content.tsx` - Main content wrapper that adjusts to sidebar state
- `theme-provider.tsx` - Dark mode theme provider
- `theme-toggle.tsx` - Theme switcher component
- `account-dropdown.tsx` - User account dropdown menu
- `traditional-login.tsx` - Email/password login form
- `magic-link-login.tsx` - Magic link authentication (code via email)
- `platform-selector.tsx` - Multi-platform selection (Hotmart, Braip, etc.)
- `product-filters-sidebar.tsx` - Comprehensive filtering sidebar with 20+ filters
- `product-card-new.tsx` - Product display card with all product details

### Type Definitions (`/app/types`)
- `auth.ts` - Authentication related types (LoginCredentials, MagicLinkRequest, etc.)
- `product.ts` - Product and filter types including Platform, Niche, Language, Currency, ProductFilters

## Design System & UI Guidelines

### Hubfi Identity - Monochromatic Design System

The project follows a strict monochromatic design with typography as the protagonist. See [IdVisual.md](IdVisual.md) for complete specification.

### Critical Rules
- **NEVER use emojis** in any component or UI element
- **NEVER use hardcoded gray colors** - Always use semantic color classes
- **NEVER use dark: prefixes** - The design system handles dark mode automatically
- **Always ensure responsive design** - Mobile-first approach with Tailwind breakpoints (sm, md, lg, xl)
- **Intuitive UX** - Clear labels, proper spacing, logical grouping of related elements

### Semantic Color Classes (Use these instead of gray-X)

**Backgrounds:**
- `bg-background` - Main page background (#FFFFFF light / #0A0A0A dark)
- `bg-card` - Card/elevated surfaces (#FFFFFF light / #1A1A1A dark)
- `bg-accent` - Hover states, highlighted areas (#F5F5F5 light / #2A2A2A dark)

**Text:**
- `text-foreground` - Primary text (#181818 light / #E5E5E5 dark)
- `text-muted-foreground` - Secondary text (#5E5E5E light / #8A8A8A dark)

**Borders:**
- `border-border` - All borders (#B7B7B7 light / #2A2A2A dark)

**Interactive:**
- `bg-primary` / `text-primary` - Primary actions (#181818 light / #E5E5E5 dark)
- `bg-secondary` / `text-secondary` - Secondary actions
- `bg-accent` / `hover:bg-accent` - Hover states

**Status:**
- `text-success` / `bg-success` - Success states, positive metrics
- `text-destructive` / `bg-destructive` - Error states, negative actions

### Typography Classes

**Titles (STIX Two font):**
- `.text-display` - Large display text (3.5rem, 56px)
- `.text-headline` - Section headlines (2.25rem, 36px)
- `.text-title` - Card/component titles (1.5rem, 24px)

**Body (Acumin Pro font):**
- `.text-body` - Regular body text (1rem, 16px)
- `.text-body-muted` - Muted body text with secondary color
- `.text-label` - Small labels and captions (0.875rem, 14px)

### Icon Guidelines
- Use icons from **Lucide React** only
- Standard sizes: `w-4 h-4`, `w-5 h-5`, `w-6 h-6`, `w-8 h-8`
- Always use semantic color classes for icon colors

### Component Patterns
- **Cards**: `bg-card border border-border rounded-md p-6`
- **Buttons**: Use semantic colors + `hover:bg-accent` or `hover:opacity-80`
- **Inputs**: `border-border focus:ring-ring` with semantic backgrounds
- **Hover states**: `hover:bg-accent transition-colors`

## HubFinder Architecture

The HubFinder is the main feature with complex filtering capabilities:

### Filters Available
1. **Platform Selection** - Multi-select from 11 platforms
2. **Language** - Portuguese, English, Spanish
3. **Currency** - BRL, USD, EUR
4. **Temperature** - Min/max range (product popularity metric)
5. **Price Range** - Min/max product price
6. **Commission Value** - Min/max commission in currency
7. **Commission Percent** - Min/max percentage (0-100%)
8. **Reviews** - Minimum star rating (1-5)
9. **Review Count** - Minimum number of reviews
10. **Blueprint Rate** - Minimum blueprint percentage
11. **Niche** - Saúde, Relacionamento, Dinheiro, Educação, etc.
12. **Text Search** - Contains/Not contains filters
13. **Affiliation Type** - CPA, CPL, RevShare
14. **Boolean Filters** - Hotleads, Recurrence, Availability, Working sales page

### State Management
- Filters stored in `ProductFilters` interface
- Platform selection separate from other filters
- Favorites tracked in Set for O(1) lookup
- useMemo for filtered products (performance optimization)

## Authentication Flow

1. User lands on `/login`
2. Choose between:
   - Traditional: email + password → redirect to `/`
   - Magic link: email → code sent → verify code → redirect to `/`
3. All authenticated pages include `<Navbar />` component

## Configuration Details

### TypeScript
- Strict mode enabled
- Target: ES2017
- Path alias: `@/*` → `./*` (root directory)
- JSX: react-jsx (React 19 automatic runtime)

### Tailwind CSS
- Using Tailwind CSS v4 with PostCSS plugin `@tailwindcss/postcss`
- Global styles imported via `@import "tailwindcss"` in `globals.css`
- No custom Tailwind config file (using defaults)
- Responsive breakpoints: `md:`, `lg:` for multi-column layouts

### ESLint
- Uses Next.js config with TypeScript support
- Flat config format (ESM)
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Key Implementation Notes

- All pages with user interaction are Client Components (`'use client'`)
- Server Components used by default for static content
- Mock data currently used in Product Finder - will be replaced with API calls
- Navbar provides consistent navigation with account management and logout
- Platform selector allows multiple platform filtering simultaneously
- Product cards show comprehensive information: score, temperature, commission, price, availability
