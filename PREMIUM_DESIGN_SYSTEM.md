# Premium Theme Design System - LINCEE

## 🎨 Design Philosophy

The LINCEE website now features a **Premium Luxury Theme** with elegant gold accents, sophisticated typography, and refined interactions. The design emphasizes minimalism, quality, and high-end aesthetics.

---

## 🎯 Color Palette

### Primary Colors
- **Gold (Luxury)**: `#d4af37` - Primary brand color, used for accents and highlights
- **Muted Gold**: `#c0a080` - Secondary accent for subtle emphasis
- **Deep Black**: `#1a1a1a` - Primary text and dark backgrounds
- **Pure Black**: `#0f0f0f` - Footer and premium sections

### Secondary Colors
- **Off-white**: `#f5f3f0` - Light background and cards
- **Dark Gray**: `#2a2a2a` - Primary text
- **Medium Gray**: `#6b6b6b` - Secondary text
- **Light Gray**: `#e8e4df` - Borders

### Accent Colors
- **Success**: `#4ecca3` - Positive actions (in stock, success states)
- **Error**: `#e74c3c` - Warnings (out of stock, errors)

---

## 📐 Typography System

### Font Family
- **Primary**: `Poppins` - Clean, modern, professional
- **Fallback**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Heading Hierarchy
```scss
h1: clamp(2.5rem, 6vw, 4.5rem) | Font Weight: 700 | Line Height: 1.1
h2: clamp(1.8rem, 4vw, 3rem)   | Font Weight: 700 | Line Height: 1.2
h3: clamp(1.4rem, 3vw, 2rem)   | Font Weight: 700 | Line Height: 1.3
h4: 1.25rem                     | Font Weight: 600
```

### Body Text
- **Default**: 1rem | Weight: 400 | Line Height: 1.8
- **Small**: 0.9rem | Weight: 400 | Line Height: 1.6

### Letter Spacing
- Headings: `-0.01em` to `-0.02em` (tight)
- Body: `0.3px` (subtle)
- Labels: `0.5px` to `0.1em` (depends on size)

---

## 🏗️ Component Styling

### Header
- **Height**: 80px (desktop), 70px (mobile)
- **Background**: Pure white with 1px bottom border
- **Logo**: Gradient text (dark to gold)
- **Navigation**: Gold underline on hover
- **Backdrop Filter**: Blur effect for frosted glass appearance

### Products Grid
- **Desktop**: `repeat(auto-fill, minmax(300px, 1fr))` gap: 40px
- **Tablet**: `repeat(auto-fill, minmax(260px, 1fr))` gap: 32px
- **Mobile**: Single column

### Product Cards
- **Border**: 1px solid $color-border
- **Shadow**: 0 2px 8px rgba(0, 0, 0, 0.04) → 0 20px 40px (on hover)
- **Hover Effect**: translateY(-12px), border becomes gold
- **Image Height**: 260px (desktop), 200px (mobile)

### Banner Section
- **Layout**: 2-column grid on desktop, stacked on mobile
- **Background**: Gradient with animated floating shapes
- **Buttons**: Gold gradient for primary, outlined for secondary
- **Spacing**: 80px padding (desktop), 60px (tablet), 40px (mobile)

### Footer
- **Background**: Deep black (#0f0f0f)
- **Text**: Light color (rgba)
- **Layout**: 4-column grid on desktop, responsive stacking
- **Links**: Gold color on hover with animated line

---

## ✨ Animations & Transitions

### Standard Transition
```scss
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Key Animations
1. **Fade In Down**: Card entrance from top
   - Duration: 0.8s
   - Staggered delays: 50ms between items

2. **Card Slide Up**: Product card entrance
   - Duration: 0.6s
   - Staggered animation

3. **Hover Effects**:
   - translateY(-2px to -12px)
   - Scale(1.05)
   - Shadow enhancement

4. **Floating Animation** (banner background):
   - Subtle up/down motion
   - Duration: 6-8s

### Easing Functions
- **Default**: `cubic-bezier(0.4, 0, 0.2, 1)` (standard motion)
- **Ease-in-out**: For smooth transitions
- **Ease**: For floating animations

---

## 🎯 Spacing System

### Base Unit: 4px

```
4px   - Extra small (micro-spacing)
8px   - Small (component internal)
12px  - Medium
16px  - Standard padding
24px  - Large (card padding)
32px  - Extra large (section gap)
40px  - Container padding (desktop)
60px  - Section gap
80px  - Section padding
120px - Large section padding
```

---

## 🔘 Button Styles

### Primary Button (Gold Gradient)
```scss
background: linear-gradient(135deg, #d4af37 0%, #c0a080 100%);
color: #1a1a1a;
padding: 12px 24px;
border-radius: 6px;
font-weight: 600;
```

### Secondary Button (Outlined)
```scss
border: 2px solid #d4af37;
color: #d4af37;
background: transparent;
padding: 12px 24px;
border-radius: 6px;
```

### Hover State
- **Transform**: translateY(-2px)
- **Shadow**: 0 8px 24px rgba(212, 175, 55, 0.3)
- **Background**: Alternate color or enhanced gradient

---

## 📱 Responsive Breakpoints

```scss
Desktop:  1400px max-width container
Laptop:   1024px and above
Tablet:   768px and below
Mobile:   480px and below
```

### Responsive Adjustments
- **Header Height**: 80px → 70px
- **Padding**: 40px → 20px
- **Gap**: 40px → 24px → 16px
- **Font Size**: Uses clamp() for fluid scaling

---

## 🎨 Material Design Integration

### Menu Panel
- **Border Radius**: 12px
- **Shadow**: 0 20px 60px rgba(0, 0, 0, 0.12)
- **Items**: Gold background on hover

### Badge
- **Background**: Gold (#d4af37)
- **Text**: Deep black
- **Font**: 0.7rem, weight 700

### Divider
- **Color**: Light gray (#e8e4df)

---

## 🖼️ Card Styles

### Product Card
```scss
border: 1px solid $color-border;
border-radius: 8px;
background: #fff;
shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

&:hover {
  shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  transform: translateY(-12px);
  border-color: $color-primary;
}
```

### Card Header (Chip Area)
- **Background**: rgba(gold, 0.02)
- **Chips**: Gold gradient or success green

---

## 📊 Visual Hierarchy

1. **Premium Aesthetic**: Gold accents guide attention
2. **Whitespace**: Generous spacing improves readability
3. **Typography**: Clear size differentiation
4. **Color Contrast**: Dark text on light backgrounds
5. **Shadows**: Subtle shadows for depth

---

## 🚀 Best Practices

### Do's ✅
- Use gold accents sparingly for maximum impact
- Maintain consistent spacing and alignment
- Use premium fonts (Poppins)
- Apply smooth cubic-bezier transitions
- Add subtle animations for engagement
- Ensure good contrast for accessibility

### Don'ts ❌
- Avoid bright, clashing colors
- Don't use oversized shadows
- Avoid gradients in backgrounds (keep clean)
- Don't animate on scroll (use entrance animations)
- Avoid bold transitions on every element

---

## 📐 Implementation Examples

### Navigation Link Hover
```scss
.nav-link {
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: $color-primary;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover::after {
    width: 100%;
  }
}
```

### Product Card Hover
```scss
.product-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-12px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    border-color: $color-primary;
  }
}
```

---

## 🎯 Future Enhancements

- Dark mode variant (charcoal background with gold text)
- Additional premium color options (silver, rose gold)
- Advanced animations for hero sections
- Micro-interactions for feedback
- Loading skeleton screens with premium styling

---

## 📞 Design Contact

For questions about the design system or implementation guidelines, refer to this document or check the component SCSS files for inline comments.

**Last Updated**: February 2026
**Theme Version**: 1.0 - Premium Luxury Edition
