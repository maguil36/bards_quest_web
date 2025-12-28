# Theme System Master Documentation

**Last Updated:** 2025
**Version:** 2.0

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Theme Transitions](#theme-transitions)
5. [User Preferences](#user-preferences)
6. [File Locations](#file-locations)
7. [Implementation Examples](#implementation-examples)

---

## Overview

This project features a sophisticated theme system that allows dynamic color schemes for comic pages with smooth transitions. The system supports:

- **12 Available Themes**: space (default/no colors), breath, light, time, heart, mind, hope, rage, life, doom, blood, void
- **Page-Specific Defaults**: Assign themes to individual pages
- **User Preferences**: Users can override themes via `/options`
- **Forced Themes**: Pages can enforce themes for story-critical moments
- **Smooth Transitions**: Multiple transition types (instant, fast, smooth, slow, fade)
- **Theme-to-Theme Transitions**: Specify both source and target themes for precise visual effects
- **Game Integration**: Dynamic theme changes based on active character in games

---

## Architecture

### Priority System

The theme system follows a strict priority order:

#### Normal Pages (overrule: false)
1. **User's specific theme choice** (breath, light, time, etc.) - HIGHEST PRIORITY
2. **Page-specific default theme** (if user selected "Default")
3. **Space theme** - LOWEST PRIORITY / FALLBACK

#### Forced Pages (overrule: true)
1. **Page's forced theme** - ALWAYS USED, ignores all user preferences

#### Game Pages (when "Default" is selected)
1. **Active character's theme** - Changes dynamically as you switch characters
2. **If user selected a specific theme** - That theme is maintained throughout

### Data Flow

```
ThemeConfig.astro (getDefaultTheme)
    ↓
[page].astro (passes theme data via data attributes)
    ↓
reader.js (applies theme to document)
    ↓
CSS (styles based on data-theme attribute)
```

---

## Configuration

### File: `src/components/ThemeConfig.astro`

This is the central configuration file where all page-specific themes are defined.

#### Interface

```typescript
export interface ThemeConfig {
  theme: string;                    // Target theme name
  originalTheme?: string;           // Optional: source theme for transitions
  overrule?: boolean;               // If true, ignores user preferences
  transition?: 'smooth' | 'instant' | 'fast' | 'slow' | 'fade' | 'scroll';
}
```

#### Function: `getDefaultTheme(chapterId: number, pageNumber: number)`

Returns `ThemeConfig | null` for a specific page.

**Example Configurations:**

```javascript
// Basic theme assignment (can be overridden by user)
if (chapterId === 1 && pageNumber === 1) {
  return { theme: 'breath', overrule: false };
}

// Forced theme (ALWAYS used, ignores user preferences)
if (chapterId === 2 && pageNumber === 15) {
  return { theme: 'rage', overrule: true };
}

// Theme with instant transition (no animation)
if (chapterId === 2 && pageNumber === 20) {
  return { theme: 'void', transition: 'instant' };
}

// Theme-to-theme transition (from time to space)
if (chapterId === 1 && pageNumber === 8) {
  return { 
    originalTheme: 'time', 
    theme: 'space', 
    transition: 'fast', 
    overrule: false 
  };
}

// Range of pages
if (chapterId === 2 && pageNumber >= 10 && pageNumber <= 20) {
  return { theme: 'mind', overrule: false };
}

// Shorthand (defaults to overrule: false, transition: 'smooth')
if (chapterId === 4 && pageNumber === 5) {
  return { theme: 'hope' };
}
```

---

## Theme Transitions

### Transition Types

| Type | Duration | Timing Function | Use Case |
|------|----------|----------------|----------|
| `instant` | 0s | - | No animation, immediate change |
| `fast` | 0.5s | ease-in-out | Quick page-to-page changes |
| `smooth` | 2s | ease-in-out | Default, balanced transition |
| `slow` | 4s | ease-in-out | Dramatic story moments |
| `fade` | 2s | ease-in-out | Subtle opacity-based transition |
| `scroll` | Dynamic | - | Gradient crawls from bottom to top as you scroll |

**Note:** The `scroll` transition requires `originalTheme` to be specified. The gradient position directly matches scroll percentage (0-100%).

### CSS Implementation

Transitions are controlled via the `data-transition` attribute on `<html>`:

```css
/* Defined in public/styles.css */
html[data-transition="instant"] * {
  transition: none !important;
}

html[data-transition="fast"] {
  --theme-transition-duration: 0.5s;
}

html[data-transition="smooth"] {
  --theme-transition-duration: 2s;
}

html[data-transition="slow"] {
  --theme-transition-duration: 4s;
}

html[data-transition="fade"] {
  --theme-transition-duration: 2s;
  /* Additional opacity transitions */
}

html[data-transition="scroll"] {
  /* No automatic transition - controlled by scroll events */
  /* Gradient overlay created dynamically via JavaScript */
  /* Gradient crawls from bottom to top as user scrolls */
}
```

### Scroll-Based Transitions (Gradient Crawl)

The `scroll` transition type creates a **gradient crawl effect** where a visual gradient moves up the page as you scroll:

**How It Works:**
1. Page loads with `originalTheme` applied
2. A fixed-position gradient overlay is created
3. As user scrolls, gradient crawls up from bottom (0% → 100%)
4. Gradient position directly matches scroll percentage
5. At 90% scroll, theme switches to target theme
6. Scrolling back up, gradient recedes and theme switches back at 10%

**Visual Effect:**
```
Top (0%)     → Original theme (100% visible)
             ↓ scroll down
25% scroll   → Gradient covers bottom 25%
50% scroll   → Gradient covers bottom 50%
75% scroll   → Gradient covers bottom 75%
90% scroll   → Theme switches to target
Bottom (100%)→ Target theme (100% visible)
```

**Configuration Example:**
```javascript
// In ThemeConfig.astro
if (chapterId === 5 && pageNumber === 1) {
  return {
    originalTheme: 'breath',  // Start theme (cyan)
    theme: 'time',            // End theme (red)
    transition: 'scroll'      // Gradient crawl
  };
}
```

**Implementation Details:**
- Creates a fixed-position overlay element (`#scroll-gradient-overlay`)
- Uses CSS `linear-gradient` with dynamic position updates
- GPU-accelerated rendering for smooth performance
- Gradient position calculated as: `scrollPercent * 100`
- Gradient colors derived from theme color variables
- No JavaScript color interpolation (pure CSS gradients)

**Performance:**
- `requestAnimationFrame` for 60fps updates
- Passive scroll listener
- No DOM reflows (only style updates)
- Hardware-accelerated CSS gradients

### Theme-to-Theme Transitions

When `originalTheme` is specified, the system:

1. **Instantly applies the original theme** (no transition)
2. **Forces a browser reflow** to ensure rendering
3. **Restores the specified transition type**
4. **Transitions to the target theme** on the next animation frame

**Implementation in `public/js/reader.js` (lines 44-78):**

```javascript
if (originalTheme && originalTheme !== effectiveTheme) {
  // Step 1: Set original theme instantly
  const currentTransition = document.documentElement.getAttribute('data-transition');
  document.documentElement.setAttribute('data-transition', 'instant');
  
  if (originalTheme === 'space') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', originalTheme);
  }
  
  // Step 2: Force reflow
  void document.documentElement.offsetHeight;
  
  // Step 3: Restore transition type
  document.documentElement.setAttribute('data-transition', currentTransition);
  
  // Step 4: Apply new theme on next frame
  requestAnimationFrame(() => {
    if (effectiveTheme === 'space') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', effectiveTheme);
    }
  });
}
```

---

## User Preferences

### Options Page: `/options`

Users can select from:

- **Default (Page-Specific)**: Uses page-defined themes; in games, themes change with active character
- **Space**: Always uses space theme (no colors), regardless of page defaults
- **Breath, Light, Time, etc.**: Always uses selected theme, overriding page defaults (unless `overrule: true`)

### Storage

Theme preference is stored in:
- **localStorage**: `mspa:theme`
- **Fallback**: If localStorage unavailable, defaults to "default"

### Implementation in `public/js/options.js` (lines 40-67)

```javascript
function applyTheme() {
  const sel = document.getElementById('sel-theme');
  if (!sel) return;
  const val = sel.value;
  try {
    localStorage.setItem('mspa:theme', val);
  } catch (e) {
    console.warn('Could not save theme preference:', e);
  }
  
  // Apply theme to current page
  if (val === 'default' || val === 'space') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', val);
  }
}
```

---

## File Locations

### Core Files

| File | Purpose | Lines of Interest |
|------|---------|-------------------|
| `src/components/ThemeConfig.astro` | Theme configuration and definitions | 1-139 (entire file) |
| `public/js/reader.js` | Theme application logic | 1-78 (theme logic), 1-202 (full file) |
| `public/js/options.js` | User preference management | 40-67 (applyTheme function) |
| `src/pages/read/[id]/[page].astro` | Page template with theme data | 46-56 (theme config extraction) |
| `src/layouts/MSPALayout.astro` | Layout with game theme listener | 48-92 (GAME_THEME_CHANGE handler) |
| `public/styles.css` | Theme color definitions and transitions | 60-175 (theme definitions) |

### Supporting Files

| File | Purpose |
|------|---------|
| `src/utils/pageUtils.js` | Page utility functions |
| `src/content.js` | Chapter and page data |

---

## Implementation Examples

### Example 1: Simple Page Theme

**Goal:** Make chapter 1, page 5 use the "breath" theme by default.

**Edit `src/components/ThemeConfig.astro`:**

```javascript
export function getDefaultTheme(chapterId: number, pageNumber: number): ThemeConfig | null {
  if (chapterId === 1 && pageNumber === 5) {
    return { theme: 'breath' };
  }
  return null;
}
```

### Example 2: Forced Theme for Dramatic Moment

**Goal:** Force chapter 2, page 15 to always use "rage" theme, ignoring user preferences.

```javascript
if (chapterId === 2 && pageNumber === 15) {
  return { theme: 'rage', overrule: true };
}
```

### Example 3: Smooth Transition Between Themes

**Goal:** Transition from "time" to "space" on chapter 1, page 8 with a fast animation.

```javascript
if (chapterId === 1 && pageNumber === 8) {
  return { 
    originalTheme: 'time', 
    theme: 'space', 
    transition: 'fast' 
  };
}
```

### Example 4: Range of Pages with Same Theme

**Goal:** Apply "mind" theme to chapter 2, pages 10-20.

```javascript
if (chapterId === 2 && pageNumber >= 10 && pageNumber <= 20) {
  return { theme: 'mind' };
}
```

### Example 5: Instant Theme Change (No Animation)

**Goal:** Change to "void" theme instantly on chapter 3, page 1.

```javascript
if (chapterId === 3 && pageNumber === 1) {
  return { theme: 'void', transition: 'instant' };
}
```

### Example 6: Slow Dramatic Transition

**Goal:** Slowly transition from "hope" to "rage" on chapter 2, page 25.

```javascript
if (chapterId === 2 && pageNumber === 25) {
  return { 
    originalTheme: 'hope', 
    theme: 'rage', 
    transition: 'slow',
    overrule: true  // Force this dramatic moment
  };
}
```

---

## Technical Details

### How Themes Are Applied

1. **Page Load**: `[page].astro` calls `getDefaultTheme()` and passes data via attributes
2. **Data Attributes**: Theme data is stored on `#reader-root` element:
   - `data-default-theme`: Target theme name
   - `data-original-theme`: Source theme (for transitions)
   - `data-overrule-theme`: "1" if forced, "0" otherwise
   - `data-transition`: Transition type
3. **JavaScript**: `reader.js` reads attributes and applies theme to `<html>` element
4. **CSS**: Styles respond to `data-theme` and `data-transition` attributes

### Theme Application Logic (reader.js)

```javascript
// Determine effective theme
let effectiveTheme;

if (overruleTheme && defaultTheme) {
  // Page forces its theme - ignore user preference
  effectiveTheme = defaultTheme;
} else if (!userTheme || userTheme === 'default') {
  // User wants default behavior - use page-specific theme or space
  effectiveTheme = defaultTheme || 'space';
} else if (userTheme === 'space') {
  // User explicitly wants space theme
  effectiveTheme = 'space';
} else {
  // User selected a specific theme
  effectiveTheme = userTheme;
}
```

### CSS Theme Variables

Themes are defined using CSS custom properties:

```css
html[data-theme="breath"] {
  --theme-primary: #00d5f2;
  --theme-secondary: #0099b3;
  /* ... more variables ... */
}

html[data-theme="rage"] {
  --theme-primary: #ff6ff2;
  --theme-secondary: #d92d9e;
  /* ... more variables ... */
}
```

---

## Best Practices

1. **Use `overrule: true` sparingly** - Only for story-critical moments
2. **Default to `transition: 'smooth'`** - Provides best user experience
3. **Use `transition: 'instant'` for rapid page flipping** - Prevents animation buildup
4. **Use `originalTheme` for specific visual effects** - When you need precise control over the transition
5. **Test with different user preferences** - Ensure themes work in all scenarios
6. **Group related pages** - Use ranges for consistent theme sections

---

## Troubleshooting

### Theme Not Applying

1. Check `getDefaultTheme()` returns correct config for the page
2. Verify `data-default-theme` attribute is set on `#reader-root`
3. Check browser console for JavaScript errors
4. Ensure CSS file is loaded

### Transition Not Working

1. Verify `data-transition` attribute is set correctly
2. Check CSS transition definitions in `public/styles.css`
3. Ensure `transition: 'instant'` isn't being used unintentionally

### User Preference Not Working

1. Check localStorage is available (not in private browsing)
2. Verify `mspa:theme` key is set correctly
3. Check if page has `overrule: true` (which ignores preferences)

---

## Related Documentation

- **GAME_THEME_INTEGRATION_MASTER.md** - Game-specific theme integration
- **src/components/ThemeConfig.astro** - Live configuration file with inline documentation

---

**End of Theme System Master Documentation**
