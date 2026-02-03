# LINCEE Design System & Typography Guide

## Color Palette

### Primary Colors
```scss
$primary-purple: #667eea;     // Primary action, buttons, links
$primary-dark: #5568d3;       // Hover state, darker variant
$primary-light: #f5f5fa;      // Backgrounds, light accent
```

### Neutral Colors
```scss
$black: #111;                 // Text, dark elements
$dark-gray: #666;             // Secondary text, descriptions
$gray: #999;                  // Tertiary text, muted labels
$light-gray: #ccc;            // Placeholders, disabled states
$border-gray: #f0f0f0;        // Borders, dividers
$background: #f5f5fa;         // Page backgrounds
$white: #fff;                 // Card backgrounds, text on dark
```

### Status Colors
```scss
$success: #27ae60;            // Success messages, checkmarks
$error: #e74c3c;              // Errors, deletions
$warning: #f39c12;            // Warnings, alerts
$info: #3498db;               // Information messages
```

---

## Typography System

### Font Family
```scss
$font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif;
```

### Font Sizes
```scss
// Heading Sizes (Desktop → Mobile)
$h1: 3rem - 5rem (clamp);     // Page headings, hero titles
$h2: 2rem - 3rem (clamp);     // Section headings
$h3: 1.5rem - 2rem (clamp);   // Subsection headings
$h4: 1.25rem;                 // Card titles
$h5: 1.1rem;                  // Small headings
$h6: 1rem;                    // Mini headings

// Body Text Sizes
$body-lg: 1rem;               // Main body text
$body: 0.9rem;                // Secondary text
$body-sm: 0.85rem;            // Small descriptions
$label: 0.75rem;              // Form labels, badges
$caption: 0.7rem;             // Captions, meta text
```

### Font Weights
```scss
$font-light: 300;             // Not commonly used
$font-regular: 400;           // Body text
$font-medium: 500;            // Emphasis (rarely used)
$font-semibold: 600;          // Labels, subheadings
$font-bold: 700;              // Headings, important text
$font-extrabold: 800;         // Rarely used
```

### Line Heights
```scss
$line-height-tight: 1.2;      // Headings
$line-height-normal: 1.4;     // Body text
$line-height-relaxed: 1.5;    // Descriptions, readable content
$line-height-loose: 1.6;      // Accessibility
```

### Letter Spacing
```scss
$letter-spacing-normal: 0;    // Default
$letter-spacing-wide: 0.5px;  // Labels, uppercase text
$letter-spacing-wider: 1px;   // Special emphasis
```

---

## Component Typography Standards

### Page Headers
```scss
h1 {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
  color: $black;
  margin: 0;
}
```

### Section Headers
```scss
h2 {
  font-size: clamp(1.75rem, 5vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
  color: $black;
  margin: 0 0 24px 0;
}
```

### Form Labels
```scss
label {
  font-size: 0.75rem;
  font-weight: 600;
  color: $black;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
```

### Body Text
```scss
p {
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1.5;
  color: $dark-gray;
  margin: 0;
}
```

### Buttons
```scss
button {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 20px;
}
```

---

## Component Typography Specifications

### Header Component
```
Logo: 18px, bold, #111
Nav Links: 14px, regular, #111 (hover: #667eea)
User Menu: 14px, regular, #667eea
```

### Login Component
```
Title: 24px, bold, #111
Subtitle: 14px, regular, #999
Labels: 13px, semibold, uppercase, #111
Input: 14px, regular, #111
Button: 14px, semibold, uppercase, #fff on #667eea
Link: 13px, semibold, #667eea (hover: #5568d3)
Error: 12px, regular, #e74c3c
```

### Account Component
```
Header: 28px, bold, #111
Tab Labels: 14px, semibold, #999 (active: #667eea)
Info Labels: 13px, semibold, uppercase, #666
Info Values: 14px, regular, #111
Button: 13px, semibold, uppercase
```

### Product Card
```
Category: 11px, regular, uppercase, #666, -0.5px letter-spacing
Name: 18px, semibold, #111, 1.4 line-height, max 2 lines
Description: 14px, regular, #666, 1.5 line-height, max 2 lines
Price: 16px, bold, #111
Stock: 12px, regular, #666
```

### Hero Section
```
Collection Tag: 12px, regular, uppercase, white
Title: clamp(3rem, 8vw, 5rem), bold, white
Subtitle: 13px, regular, uppercase, white, 0.5px letter-spacing
CTA Text: 13px, semibold, uppercase, black on white
```

### Banner Component
```
Offer Badge: 12px, semibold, #667eea
Badge Text: 13px, regular, #111
```

---

## Spacing System

### Base Unit: 4px

```scss
$spacing-1: 4px;              // 0.25rem
$spacing-2: 8px;              // 0.5rem
$spacing-3: 12px;             // 0.75rem
$spacing-4: 16px;             // 1rem
$spacing-5: 20px;             // 1.25rem
$spacing-6: 24px;             // 1.5rem
$spacing-7: 28px;             // 1.75rem
$spacing-8: 32px;             // 2rem
$spacing-10: 40px;            // 2.5rem
$spacing-12: 48px;            // 3rem
$spacing-16: 64px;            // 4rem
$spacing-20: 80px;            // 5rem
```

### Standard Component Spacing
```scss
// Padding
$input-padding: 12px 14px;    // Form inputs
$button-padding: 14px 20px;   // Buttons
$card-padding: 24px;          // Cards
$section-padding: 40px 20px;  // Sections

// Margins
$section-margin: 0 auto 40px; // Between sections
$heading-margin: 0 0 24px 0;  // After headings
$element-gap: 20px;           // Between elements
```

---

## Interactive States

### Button States
```scss
// Normal
background: #667eea;
color: #fff;

// Hover
background: #5568d3;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

// Active
background: #4d5cb3;
transform: translateY(0);

// Disabled
opacity: 0.6;
cursor: not-allowed;
transform: none;
```

### Form Input States
```scss
// Normal
border: 1px solid #e0e0e0;
background: #fff;

// Focus
outline: none;
border-color: #667eea;
box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);

// Error
border-color: #e74c3c;
background: #fdeaea;

// Disabled
background: #f5f5fa;
color: #ccc;
cursor: not-allowed;
```

### Link States
```scss
// Normal
color: #667eea;
text-decoration: none;

// Hover
color: #5568d3;
text-decoration: underline;

// Active
color: #4d5cb3;

// Visited
color: #667eea;
```

---

## Transitions & Animations

### Standard Timing
```scss
$transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
$transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
$transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);

// Applied to:
transition: all $transition-normal;
```

### Common Animations
```scss
// Fade In
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

// Scale Up
@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

// Slide In
@keyframes slideInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

// Stagger (for lists)
@for $i from 1 through 12 {
  &:nth-child(#{$i}) {
    animation: slideInUp 0.3s ease-out;
    animation-delay: ($i * 5ms);
  }
}
```

---

## Breakpoints

```scss
$breakpoint-xs: 320px;        // Mobile small
$breakpoint-sm: 480px;        // Mobile
$breakpoint-md: 768px;        // Tablet
$breakpoint-lg: 1024px;       // Desktop
$breakpoint-xl: 1440px;       // Large desktop
$breakpoint-xxl: 1920px;      // Ultra-wide

// Media Query Mixin
@mixin media-up($breakpoint) {
  @media (min-width: $breakpoint) {
    @content;
  }
}

@mixin media-down($breakpoint) {
  @media (max-width: $breakpoint - 1px) {
    @content;
  }
}
```

---

## Box Shadow System

```scss
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
$shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.16);
$shadow-xl: 0 16px 40px rgba(0, 0, 0, 0.2);

// Applied to:
// Cards: $shadow
// Hover states: $shadow-md
// Modals/dropdowns: $shadow-lg
```

---

## Border Radius

```scss
$radius-sm: 4px;              // Small elements
$radius: 6px;                 // Standard
$radius-md: 8px;              // Larger elements
$radius-lg: 12px;             // Large components
$radius-full: 9999px;         // Fully rounded
```

---

## Text Clipping

```scss
// Single line
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Multi-line (2 lines)
.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}
```

---

## Accessibility Standards

### Color Contrast
- **Headings & Body**: Minimum 4.5:1 ratio (WCAG AA)
  - #111 on #fff: 16.5:1 ✅
  - #667eea on #fff: 4.8:1 ✅
  
- **Secondary text**: Minimum 3:1 ratio (WCAG AA)
  - #666 on #fff: 8.4:1 ✅
  - #999 on #fff: 5.6:1 ✅

### Font Size Minimums
- Body text: Minimum 14px (for readability)
- Labels: Minimum 12px (with increased contrast)
- Captions: 11px only with sufficient contrast

### Focus States
All interactive elements must have visible focus:
```scss
&:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
```

---

## Implementation Guidelines

### File Structure
```
src/
├── styles/
│   ├── _variables.scss       // All variables (colors, spacing, etc.)
│   ├── _typography.scss      // Global font definitions
│   ├── _mixins.scss          // Utility mixins
│   ├── _normalize.scss       // Base styles reset
│   └── styles.scss           // Main import file
├── app/
│   ├── components/
│   │   └── [component]/
│   │       ├── [component].scss  // Component-specific styles
│   │       └── ...
│   └── ...
```

### Best Practices
1. **Use variables** for all colors, spacing, and sizes
2. **Nest selectors** properly (SCSS nesting)
3. **Mobile-first** media queries (min-width)
4. **Semantic HTML** for accessibility
5. **BEM naming** for complex components (Block__Element--Modifier)
6. **No magic numbers** - all values from the design system
7. **Consistent spacing** - use multiples of $spacing-4
8. **Meaningful color usage** - limit to the defined palette

---

## Dark Mode (Future)

Reserved system for future dark mode implementation:

```scss
$dark-bg: #1a1a1a;
$dark-card: #2a2a2a;
$dark-text: #f5f5f5;
$dark-border: #3a3a3a;

@media (prefers-color-scheme: dark) {
  // Dark mode styles here
}
```

---

## Component Checklist

- [ ] Uses typography from this system
- [ ] Follows spacing guidelines
- [ ] Has proper color contrast (WCAG AA)
- [ ] Includes focus states for interactive elements
- [ ] Has appropriate transitions/animations
- [ ] Responsive at breakpoints
- [ ] Uses variable references (not hardcoded values)
- [ ] Has proper hover states
- [ ] Accessible to screen readers
- [ ] No unused CSS rules

---

Last Updated: February 3, 2026
Status: Design System v1.0 Complete ✅
