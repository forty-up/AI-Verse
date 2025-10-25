# EmotiSense - Modern Monochrome Theme Guide

## 🎨 Color Palette

### Primary Colors
- **Violet Accent**: `#8A63D2` - Primary CTA buttons, interactive elements
- **Lavender Light**: `#C7B9E8` - Hover states, subtle accents
- **Dark Background**: `#1a1a1a` - Main background color

### Neutral Colors
- **Pure White**: `#FFFFFF` - Headings, primary text
- **Light Gray**: `#E0E0E0` - Taglines, secondary text
- **Medium Gray**: `#9E9E9E` - Tertiary text, disabled states
- **Black**: `#000000` - Pure black for contrast

## 🖼️ Background

### Mountain Image
- **Treatment**: Desaturated to monochrome (100% grayscale)
- **Opacity**: 15%
- **Filter**: `grayscale(100%) contrast(1.1)`
- **Effect**: Professional, sharp, and minimal

This creates a sophisticated backdrop that doesn't compete with content.

## 🔘 Buttons & CTAs

### Primary Button (`.btn-primary`)
```css
background: #8A63D2 (Violet)
color: #FFFFFF (White)
effect: Scale on hover (1.02x)
shadow: Elevation shadow
```
**Usage**: Main CTAs like "Start Detection", "Try Now"

### Secondary Button (`.btn-secondary`)
```css
background: rgba(255, 255, 255, 0.25) (Glassmorphism)
backdrop-filter: blur(10px)
border: 1px solid rgba(255, 255, 255, 0.3)
color: #FFFFFF (White)
```
**Usage**: "How It Works", navigation buttons

## 📦 Components

### Glass Effect (`.glass-effect`)
```css
background: rgba(255, 255, 255, 0.05)
backdrop-filter: blur(10px)
border: 1px solid rgba(255, 255, 255, 0.1)
```
**Usage**: Cards, panels, webcam container

### Card (`.card`)
```css
background: rgba(255, 255, 255, 0.05)
backdrop-filter: blur(10px)
border: 1px solid rgba(255, 255, 255, 0.1)
hover: Scale (1.02x)
```
**Usage**: Feature cards, info boxes

## ✨ Typography

### Headings
- **Color**: `#FFFFFF` (Crisp White)
- **Font**: Work Sans
- **Weight**: Bold (700-800)
- **Usage**: Main titles, section headings

### Body Text
- **Primary**: `#FFFFFF` (White) - Main content
- **Secondary**: `#E0E0E0` (Light Gray) - Taglines, descriptions
- **Tertiary**: `#9E9E9E` (Medium Gray) - Labels, metadata

## 🎯 Design Philosophy

### Modern
- Clean lines
- Minimalist approach
- No clutter

### Focused
- High contrast (white on dark)
- Clear visual hierarchy
- Attention-directing violet accents

### Smart
- Glassmorphism for depth
- Subtle gradients
- Professional monochrome base

### Minimalist
- Limited color palette
- Generous whitespace
- Essential elements only

## 🌟 Key Effects

### Glassmorphism
```css
background: rgba(255, 255, 255, 0.05-0.25)
backdrop-filter: blur(10px)
border: 1px solid rgba(255, 255, 255, 0.1-0.3)
```

### Accent Glow
```css
box-shadow: 0 0 30px rgba(138, 99, 210, 0.4)
```

### Subtle Gradients
```css
radial-gradient(
  circle at 20% 30%,
  rgba(138, 99, 210, 0.08) 0%,
  transparent 50%
)
```

## 🎨 Color Usage Guidelines

### When to Use Violet (#8A63D2)
- ✅ Primary action buttons
- ✅ Interactive elements
- ✅ Focus states
- ✅ Important highlights
- ✅ Scrollbar thumb
- ❌ Body text
- ❌ Large backgrounds

### When to Use White (#FFFFFF)
- ✅ Main headings
- ✅ Button text on violet
- ✅ Primary content text
- ✅ Icons on dark backgrounds
- ❌ Backgrounds (use transparent white instead)

### When to Use Light Gray (#E0E0E0)
- ✅ Taglines
- ✅ Subtitles
- ✅ Secondary descriptions
- ✅ Placeholder text

## 🔄 State Variations

### Hover States
- **Buttons**: Scale up to 102%, increased shadow
- **Cards**: Scale up to 102%, enhanced glow
- **Links**: Color shift to lavender (#C7B9E8)

### Active States
- **Buttons**: Slight scale down (98%)
- **Inputs**: Violet border glow

### Disabled States
- **Opacity**: 0.5
- **Color**: Medium gray (#9E9E9E)
- **Cursor**: not-allowed

## 📱 Responsive Considerations

### Desktop
- Full glassmorphism effects
- All animations enabled
- Maximum blur values

### Mobile
- Reduced blur for performance
- Simplified shadows
- Touch-friendly button sizes (min 44px)

## 🎭 Emotion Detection Colors

These remain colorful for functional reasons:

```javascript
Angry: #FF4444 (Red)
Disgust: #9C27B0 (Purple)
Fear: #FF9800 (Orange)
Happy: #4CAF50 (Green)
Neutral: #607D8B (Blue Gray)
Sad: #2196F3 (Blue)
Surprise: #FFEB3B (Yellow)
```

These provide instant emotional feedback and are kept vibrant for clarity.

## 🛠️ Implementation

### CSS Variables
```css
:root {
  --accent: #8A63D2;
  --accent-light: #C7B9E8;
  --dark: #1a1a1a;
  --white: #FFFFFF;
  --gray-light: #E0E0E0;
  --gray-medium: #9E9E9E;
  --black: #000000;
}
```

### Usage in Components
```jsx
// Primary button
<button className="btn-primary">Start</button>

// Secondary button
<button className="btn-secondary">Learn More</button>

// Glass card
<div className="glass-effect">Content</div>

// Accent text
<span className="text-[#8A63D2]">Highlight</span>
```

## ✅ Accessibility

### Contrast Ratios
- **White on Dark**: 18.5:1 (AAA)
- **Violet on Dark**: 4.8:1 (AA)
- **Light Gray on Dark**: 12.6:1 (AAA)

### Focus Indicators
- Violet outline (#8A63D2)
- 2px solid border
- Clear visual feedback

## 🎬 Animation Guidelines

### Micro-interactions
- **Duration**: 200-300ms
- **Easing**: ease-out for entrance, ease-in for exit
- **Scale**: Never exceed 1.05x

### Page Transitions
- **Duration**: 500-800ms
- **Easing**: cubic-bezier for smooth flow
- **Opacity**: Fade in/out

## 📊 Visual Hierarchy

1. **Primary**: White headings + Violet CTAs
2. **Secondary**: Light gray text + Glass containers
3. **Tertiary**: Medium gray labels + Subtle borders

---

**This theme creates a modern, professional, and focused experience that emphasizes content while maintaining visual interest through subtle glassmorphism and strategic violet accents.** 🎨✨
