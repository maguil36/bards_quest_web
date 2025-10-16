# Theme Transition System

The Bards Quest theme system now supports configurable transitions that can be set on a per-page basis through `ThemeConfig.astro`.

## Available Transition Types

### 1. **smooth** (default)
- **Duration:** 2 seconds
- **Timing:** ease-in-out
- **Use case:** Standard theme changes, most common scenario
- **Properties animated:** background, background-color, border-color, color

```typescript
return { theme: 'time', transition: 'smooth' };
```

### 2. **instant**
- **Duration:** None (immediate)
- **Timing:** N/A
- **Use case:** Sudden reveals, shocking moments, or when you want an immediate visual change
- **Properties animated:** None

```typescript
return { theme: 'rage', transition: 'instant' };
```

### 3. **fast**
- **Duration:** 0.5 seconds
- **Timing:** ease-in-out
- **Use case:** Quick mood changes, rapid scene transitions
- **Properties animated:** background, background-color, border-color, color

```typescript
return { theme: 'heart', transition: 'fast' };
```

### 4. **slow**
- **Duration:** 4 seconds
- **Timing:** ease-in-out
- **Use case:** Dramatic moments, important story beats, emotional scenes
- **Properties animated:** background, background-color, border-color, color

```typescript
return { theme: 'void', transition: 'slow', overrule: true };
```

### 5. **fade**
- **Duration:** 2 seconds
- **Timing:** ease-in-out
- **Use case:** Dream sequences, flashbacks, ethereal moments
- **Properties animated:** background, background-color, border-color, color, opacity

```typescript
return { theme: 'hope', transition: 'fade' };
```

## How It Works

### Page-Specific Configuration

In `src/components/ThemeConfig.astro`, you can specify the transition type for each page:

```typescript
export function getDefaultTheme(chapterId: number, pageNumber: number): ThemeConfig | null {
  if (chapterId === 1) {
    // Dramatic entrance with slow transition
    if (pageNumber === 1) return { theme: 'time', transition: 'slow' };
    
    // Quick change to space theme
    if (pageNumber === 5) return { theme: 'space', transition: 'fast' };
    
    // Instant shock moment
    if (pageNumber === 10) return { theme: 'rage', transition: 'instant' };
  }
  
  return null;
}
```

### Default Behavior

- If no `transition` is specified, it defaults to `'smooth'`
- All pages automatically get the `data-transition` attribute set
- The transition applies to all theme changes on that page

### CSS Implementation

The transitions are implemented using CSS data attributes:

```css
html[data-transition="smooth"] * {
  transition: background 2s ease-in-out,
              background-color 2s ease-in-out,
              border-color 2s ease-in-out,
              color 2s ease-in-out;
}
```

### JavaScript Integration

The transition type is:
1. Set in `ThemeConfig.astro` for each page
2. Passed as a data attribute to the reader root element
3. Applied to `document.documentElement` by `reader.js`
4. Maintained when themes change via options or game interactions

## Examples

### Example 1: Chapter Opening
```typescript
// Slow, dramatic transition for chapter opening
if (chapterId === 2 && pageNumber === 1) {
  return { theme: 'void', transition: 'slow', overrule: true };
}
```

### Example 2: Action Sequence
```typescript
// Fast transitions for rapid action
if (chapterId === 3 && pageNumber >= 10 && pageNumber <= 15) {
  return { theme: 'rage', transition: 'fast' };
}
```

### Example 3: Plot Twist
```typescript
// Instant transition for shocking reveal
if (chapterId === 4 && pageNumber === 20) {
  return { theme: 'blood', transition: 'instant', overrule: true };
}
```

### Example 4: Dream Sequence
```typescript
// Fade transition for ethereal moments
if (chapterId === 5 && pageNumber >= 5 && pageNumber <= 10) {
  return { theme: 'hope', transition: 'fade' };
}
```

## Technical Details

### Affected Elements
- `html` element
- `body` element
- All elements (`*`) - ensures consistent transitions across the entire page

### Properties Transitioned
- `background`
- `background-color`
- `border-color`
- `color`
- `opacity` (fade transition only)

### Browser Compatibility
The transition system uses standard CSS transitions and is compatible with all modern browsers.

### Performance
Transitions are hardware-accelerated where possible. The `instant` transition type can be used on pages where performance is critical or animations are undesirable.
