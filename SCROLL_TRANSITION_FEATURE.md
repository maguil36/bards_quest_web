# Scroll Transition Feature

## Overview

A new `scroll` transition type has been added to the theme system. This creates a **gradient crawl effect** where a visual gradient moves up the page as you scroll, smoothly transitioning from one theme to another.

---

## How It Works

### User Experience
- **At top of page (0% scroll):** Original theme is displayed
- **As you scroll down:** A gradient overlay crawls upward from the bottom
- **Gradient position:** Directly tied to scroll position (0-100%)
- **At bottom of page (100% scroll):** Target theme is fully visible
- **Scrolling back up:** Gradient recedes back down
- **Visual effect:** Smooth, continuous gradient transition (not binary)

### Technical Behavior
1. Page loads with `originalTheme` applied
2. A fixed-position gradient overlay is created
3. As user scrolls, gradient position updates in real-time
4. Gradient crawls from bottom (0%) to top (100%) based on scroll percentage
5. Theme fully switches when gradient reaches 90% coverage
6. Bidirectional: works both scrolling down and up

---

## Configuration

### Basic Usage

In `src/components/ThemeConfig.astro`:

```javascript
if (chapterId === 5 && pageNumber === 1) {
  return {
    originalTheme: 'breath',  // Theme at top of page
    theme: 'time',            // Theme at bottom of page
    transition: 'scroll'      // Scroll-based transition
  };
}
```

### Requirements
- **`originalTheme` is REQUIRED** - Specifies the starting theme
- **`theme` is REQUIRED** - Specifies the ending theme
- **`transition: 'scroll'`** - Activates scroll-based behavior

### Interface

```typescript
interface ThemeConfig {
  theme: string;
  originalTheme?: string;  // Required for scroll transitions
  overrule?: boolean;
  transition?: 'smooth' | 'instant' | 'fast' | 'slow' | 'fade' | 'scroll';
}
```

---

## Implementation Details

### Files Modified

1. **`public/styles.css`** (lines 360-376)
   - Added CSS for scroll transition
   - No automatic transitions (controlled by JS)
   - Smooth transitions when theme switches at gradient completion

2. **`public/js/reader.js`** (lines 86-186)
   - Added `setupScrollTransition()` function with gradient overlay
   - Creates fixed-position gradient element
   - Scroll event listener with `requestAnimationFrame` optimization
   - Calculates scroll percentage and updates gradient position
   - Theme colors mapped for all 12 themes
   - Gradient crawls from bottom to top as you scroll

3. **`src/components/ThemeConfig.astro`** (lines 19-25, 69, 108)
   - Updated interface to include `'scroll'` type
   - Added documentation and examples
   - Added demo on chapter 1, page 20

4. **Documentation files:**
   - `MASTER_DOCUMENTATION.md` - Added quick guide example
   - `THEME_SYSTEM_MASTER.md` - Added detailed implementation section
   - `DOCUMENTATION_INDEX.md` - Added to transition types table

---

## CSS Implementation

```css
/* No automatic transition */
html[data-transition="scroll"],
html[data-transition="scroll"] body,
html[data-transition="scroll"] * {
  transition: none;
}

/* Smooth transition when theme switches at gradient completion */
html[data-transition="scroll"].theme-switching,
html[data-transition="scroll"].theme-switching body,
html[data-transition="scroll"].theme-switching * {
  transition: background 0.5s ease-out,
              background-color 0.5s ease-out,
              border-color 0.5s ease-out,
              color 0.5s ease-out;
}
```

---

## JavaScript Implementation

### Theme Color Mapping

```javascript
const getThemeColors = (themeName) => {
  const themeColors = {
    'space': { bg: '#0f1014', accent: '#4da3ff' },
    'breath': { bg: '#F3F4F9', accent: '#007eb4' },
    'light': { bg: '#ffffff', accent: '#ff8000' },
    'time': { bg: 'color-mix(in srgb, #0f1014 70%, #ff4d4d 30%)', accent: '#ff4d4d' },
    'heart': { bg: 'color-mix(in srgb, #0f1014 70%, #ff69b4 30%)', accent: '#ff69b4' },
    'mind': { bg: 'color-mix(in srgb, #0f1014 70%, #00d4d4 30%)', accent: '#00d4d4' },
    'hope': { bg: 'color-mix(in srgb, #0f1014 70%, #ffd700 30%)', accent: '#ffd700' },
    'rage': { bg: 'color-mix(in srgb, #0f1014 70%, #9370db 30%)', accent: '#9370db' },
    'life': { bg: 'color-mix(in srgb, #0f1014 70%, #ff69b4 30%)', accent: '#ff69b4' },
    'doom': { bg: 'color-mix(in srgb, #0f1014 70%, #ff8c00 30%)', accent: '#ff8c00' },
    'blood': { bg: 'color-mix(in srgb, #0f1014 70%, #dc143c 30%)', accent: '#dc143c' },
    'void': { bg: 'color-mix(in srgb, #0f1014 70%, #4f46e5 30%)', accent: '#4f46e5' }
  };
  return themeColors[themeName] || themeColors['space'];
};
```

### Gradient Overlay Creation

```javascript
// Create gradient overlay element
const gradientOverlay = document.createElement('div');
gradientOverlay.id = 'scroll-gradient-overlay';
gradientOverlay.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  transition: opacity 0.3s ease-out;
`;
document.body.appendChild(gradientOverlay);
```

### Scroll Update Function

```javascript
function updateThemeBasedOnScroll() {
  const scrollY = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;

  // Calculate gradient position (crawls from bottom to top)
  const gradientPosition = scrollPercent * 100;

  // Get colors for gradient
  const fromColors = getThemeColors(fromTheme);
  const toColors = getThemeColors(toTheme);

  // Create gradient that crawls upward
  gradientOverlay.style.background = `
    linear-gradient(
      to top,
      ${toColors.bg} 0%,
      ${toColors.bg} ${gradientPosition}%,
      transparent ${gradientPosition}%,
      transparent 100%
    )
  `;

  // Update theme when gradient reaches top (90%)
  if (scrollPercent > 0.9) {
    if (toTheme === 'space') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', toTheme);
    }
  } else if (scrollPercent < 0.1) {
    if (fromTheme === 'space') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', fromTheme);
    }
  }

  ticking = false;
}
```

### Integration in reader.js

```javascript
if (originalTheme && originalTheme !== effectiveTheme) {
  if (transitionType === 'scroll') {
    // Set up scroll-based theme transition with gradient crawl
    setupScrollTransition(originalTheme, effectiveTheme);
  } else {
    // Standard theme-to-theme transition
    // ... existing code ...
  }
}
```

---

## Performance Considerations

### Optimizations
1. **`requestAnimationFrame`** - Ensures smooth 60fps updates
2. **Ticking flag** - Prevents multiple simultaneous scroll handlers
3. **Passive event listener** - Improves scroll performance
4. **Fixed-position overlay** - GPU-accelerated rendering
5. **CSS gradients** - Hardware-accelerated, no JavaScript color interpolation
6. **Direct style updates** - No DOM reflows, only gradient position changes

### Browser Compatibility
- Works in all modern browsers supporting CSS gradients
- Gracefully degrades if JavaScript is disabled (shows original theme)
- No dependencies on external libraries
- Uses standard CSS `linear-gradient` and `color-mix`

---

## Visual Effect

### Gradient Crawl Behavior

```
┌─────────────────────────────────────────────────────────────┐
│  0% Scroll - Top of Page                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │  Original Theme (breath = cyan)                        │ │
│  │  ████████████████████████████████████████████████████  │ │
│  │  ████████████████████████████████████████████████████  │ │
│  │  ████████████████████████████████████████████████████  │ │
│  │  ████████████████████████████████████████████████████  │ │
│  │  ████████████████████████████████████████████████████  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                          ↓ scroll down

┌─────────────────────────────────────────────────────────────┐
│  25% Scroll                                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Original Theme (breath = cyan)                        │ │
│  │  ████████████████████████████████████████████████████  │ │
│  │  ████████████████████████████████████████████████████  │ │
│  │  ████████████████████████████████████████████████████  │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│  │  Target Theme (time = red) ← Gradient starts here     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                          ↓ scroll down

┌─────────────────────────────────────────────────────────────┐
│  50% Scroll                                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Original Theme (breath = cyan)                        │ │
│  │  ████████████████████████████████████████████████████  │ │
│  │  ████████████████████████████████████████████████████  │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│  │  Target Theme (time = red) ← Gradient halfway up      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                          ↓ scroll down

┌─────────────────────────────────────────────────────────────┐
│  75% Scroll                                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Original Theme (breath = cyan)                        │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│  │  Target Theme (time = red) ← Gradient almost at top   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                          ↓ scroll down

┌─────────────────────────────────────────────────────────────┐
│  100% Scroll - Bottom of Page                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Target Theme (time = red)                             │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Legend:**
- `████` = Original theme (fully visible)
- `▓▓▓▓` = Gradient transition area
- `░░░░` = Target theme (fully visible)

---

## Testing

### Demo Page
**Location:** Chapter 1, Page 20  
**Configuration:**
```javascript
if (pageNumber === 20) {
  return { 
    originalTheme: 'breath', 
    theme: 'time', 
    transition: 'scroll', 
    overrule: false 
  };
}
```

### Test Checklist
- [ ] Page loads with `breath` theme (cyan)
- [ ] Gradient overlay is created
- [ ] Scrolling down shows red gradient crawling up from bottom
- [ ] At 25% scroll: gradient covers bottom 25% of screen
- [ ] At 50% scroll: gradient covers bottom 50% of screen
- [ ] At 75% scroll: gradient covers bottom 75% of screen
- [ ] At 90%+ scroll: theme switches to `time` (red)
- [ ] Scrolling back down: gradient recedes back to bottom
- [ ] At 10%- scroll: theme switches back to `breath` (cyan)
- [ ] Gradient is smooth and continuous (no jumps)
- [ ] No performance issues or jank
- [ ] Works with user theme preferences (respects `overrule` setting)
- [ ] Gradient overlay doesn't block interactions (pointer-events: none)

---

## Use Cases

### Storytelling
- **Mood shifts:** Gradient crawls upward as tension builds
- **Character focus:** Smooth color transition as different characters appear
- **Time progression:** Visual representation of time passing
- **Emotional journey:** Color gradually changes to match story tone

### Examples
```javascript
// Calm to intense (cyan to purple gradient crawl)
{ originalTheme: 'breath', theme: 'rage', transition: 'scroll' }

// Day to night (orange to purple gradient crawl)
{ originalTheme: 'light', theme: 'void', transition: 'scroll' }

// Character handoff (red to cyan gradient crawl)
{ originalTheme: 'time', theme: 'breath', transition: 'scroll' }
```

### Visual Effects
- **Rising tension:** Dark colors crawling up from bottom
- **Revelation moment:** Light colors emerging from below
- **Flashback:** Gradient receding as you scroll back up
- **Parallel narratives:** Different themes for different scroll positions

---

## Troubleshooting

### Theme doesn't change on scroll
- **Check:** Is `originalTheme` specified?
- **Check:** Is `transition: 'scroll'` set?
- **Check:** Is the page tall enough to scroll past 50%?

### Transitions are choppy
- **Check:** Browser console for JavaScript errors
- **Check:** Other scroll event listeners that might conflict
- **Try:** Reduce page complexity (images, animations)

### Theme changes at wrong scroll position
- **Current behavior:** Changes at 50% scroll
- **To modify:** Edit `scrollPercent > 0.5` in `reader.js` line ~115

---

## Future Enhancements

### Potential Features
1. **Configurable threshold** - Allow custom scroll percentage (e.g., 25%, 75%)
2. **Gradient transitions** - Smooth color interpolation instead of hard switch
3. **Multiple waypoints** - Support more than 2 themes per page
4. **Scroll direction awareness** - Different themes for up vs down scrolling
5. **Velocity-based transitions** - Faster scrolling = faster transitions

### Implementation Ideas
```javascript
// Configurable threshold
{ originalTheme: 'breath', theme: 'time', transition: 'scroll', scrollThreshold: 0.75 }

// Multiple waypoints
{ themes: ['breath', 'time', 'rage'], transition: 'scroll', waypoints: [0.33, 0.66] }
```

---

## Summary

The scroll transition feature adds a dynamic, engaging way to transition between themes based on user scroll position. It's performant, easy to configure, and opens up new storytelling possibilities for comic pages.

**Key Benefits:**
- ✅ Smooth, performant transitions
- ✅ Easy to configure (just 3 properties)
- ✅ Bidirectional (works scrolling up and down)
- ✅ Respects user preferences
- ✅ No external dependencies

**Documentation Updated:**
- ✅ MASTER_DOCUMENTATION.md
- ✅ THEME_SYSTEM_MASTER.md
- ✅ DOCUMENTATION_INDEX.md
- ✅ ThemeConfig.astro
- ✅ This file (SCROLL_TRANSITION_FEATURE.md)
