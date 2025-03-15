# UI Design System

## Overview

This document outlines the UI design system for the MCP Mindfulness application. The design system will serve as the foundation for all frontend development, ensuring consistency, accessibility, and a cohesive user experience across the application.

## Design Principles

### 1. Clarity
- Clear visual hierarchy
- Intuitive interactions
- Straightforward information architecture
- Minimal cognitive load

### 2. Calmness
- Soothing color palette
- Generous whitespace
- Smooth transitions and animations
- Reduced visual noise

### 3. Consistency
- Uniform component behavior
- Predictable patterns
- Standardized spacing and sizing
- Coherent visual language

### 4. Accessibility
- WCAG 2.1 AA compliance
- Inclusive design patterns
- Keyboard navigability
- Screen reader support

### 5. Responsiveness
- Mobile-first approach
- Fluid layouts
- Adaptive components
- Context-aware interactions

## Design Tokens

### Colors

#### Primary Palette
- Primary: `#4A90E2` - Main brand color
- Primary Light: `#7EB6FF` - Lighter variant
- Primary Dark: `#2A5298` - Darker variant

#### Secondary Palette
- Secondary: `#50E3C2` - Accent color
- Secondary Light: `#B9FFF1` - Lighter variant
- Secondary Dark: `#00B894` - Darker variant

#### Neutrals
- White: `#FFFFFF`
- Gray 100: `#F7F9FC`
- Gray 200: `#EDF2F7`
- Gray 300: `#E2E8F0`
- Gray 400: `#CBD5E0`
- Gray 500: `#A0AEC0`
- Gray 600: `#718096`
- Gray 700: `#4A5568`
- Gray 800: `#2D3748`
- Gray 900: `#1A202C`
- Black: `#000000`

#### Semantic Colors
- Success: `#48BB78` - Positive actions/states
- Warning: `#ECC94B` - Cautionary actions/states
- Error: `#F56565` - Negative actions/states
- Info: `#4299E1` - Informational actions/states

### Typography

#### Font Families
- Primary: 'Inter', sans-serif
- Secondary: 'Georgia', serif
- Monospace: 'Roboto Mono', monospace

#### Font Sizes
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)
- 5xl: 3rem (48px)

#### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- SemiBold: 600
- Bold: 700

#### Line Heights
- Tight: 1.25
- Base: 1.5
- Loose: 1.75

### Spacing

- 0: 0
- 1: 0.25rem (4px)
- 2: 0.5rem (8px)
- 3: 0.75rem (12px)
- 4: 1rem (16px)
- 5: 1.25rem (20px)
- 6: 1.5rem (24px)
- 8: 2rem (32px)
- 10: 2.5rem (40px)
- 12: 3rem (48px)
- 16: 4rem (64px)
- 20: 5rem (80px)
- 24: 6rem (96px)

### Borders

#### Border Widths
- 0: 0
- 1: 1px
- 2: 2px
- 4: 4px
- 8: 8px

#### Border Radii
- None: 0
- SM: 0.125rem (2px)
- Base: 0.25rem (4px)
- MD: 0.375rem (6px)
- LG: 0.5rem (8px)
- XL: 0.75rem (12px)
- 2XL: 1rem (16px)
- Full: 9999px

### Shadows

- XS: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- SM: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)`
- MD: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- LG: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- XL: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
- 2XL: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`

## Component Guidelines

### Buttons

#### Variants
- Primary: Main call-to-action
- Secondary: Alternative actions
- Tertiary: Less prominent actions
- Ghost: Minimal visual presence
- Link: Text-only appearance

#### Sizes
- Small: Compact UI elements
- Medium: Standard size (default)
- Large: Prominent actions

#### States
- Default: Normal state
- Hover: Mouse over
- Active: Being clicked
- Focus: Keyboard focus
- Disabled: Unavailable

### Form Elements

#### Text Inputs
- Default
- Focus
- Error
- Disabled
- With icon
- With validation

#### Selects
- Single select
- Multi-select
- Searchable
- With groups

#### Checkboxes and Radios
- Default
- Checked
- Indeterminate (checkboxes)
- Disabled

### Cards

#### Variants
- Default: Standard container
- Interactive: Clickable card
- Elevated: With shadow
- Outlined: Border only

#### Content Guidelines
- Consistent padding
- Clear hierarchy
- Limited content density
- Actionable elements positioning

### Navigation

#### Primary Navigation
- Desktop: Horizontal or sidebar
- Mobile: Bottom tabs or drawer
- Active state indication
- Responsive behavior

#### Secondary Navigation
- Tabs
- Breadcrumbs
- Pagination
- Steppers

### Feedback

#### Alerts and Notifications
- Success
- Warning
- Error
- Info
- Dismissible
- With actions

#### Loaders and Progress
- Spinner
- Progress bar
- Skeleton loading
- Load more indicators

## Responsive Breakpoints

- XS: 0px (default)
- SM: 640px
- MD: 768px
- LG: 1024px
- XL: 1280px
- 2XL: 1536px

## Accessibility Guidelines

### Color Contrast
- Text: Minimum 4.5:1 ratio (WCAG AA)
- Large Text: Minimum 3:1 ratio
- UI Components: Minimum 3:1 ratio

### Keyboard Navigation
- Focus indicators
- Logical tab order
- Keyboard shortcuts
- Focus trapping for modals

### Screen Readers
- Semantic HTML
- ARIA attributes
- Alternative text
- Announcements for dynamic content

### Motion and Animation
- Respect reduced motion preferences
- Avoid flashing content
- Provide controls for video/animation
- Keep animations subtle and purposeful

## Implementation Guidelines

### CSS Architecture
- Utility-first approach with TailwindCSS
- Component-specific styles when needed
- CSS variables for theming
- Mobile-first media queries

### Component Structure
- Functional components with TypeScript
- Props documentation
- Default props
- Prop validation

### Theming
- Light and dark mode support
- Theme switching mechanism
- Color mode preferences
- Theme extension capabilities

## Design-to-Development Workflow

1. Design in Figma
2. Export design tokens
3. Implement in component library
4. Document in Storybook
5. Test for accessibility
6. Integrate into application

## Resources

- Figma Design System
- Component Storybook
- Accessibility Checklist
- Design Token Repository
- Icon Library 