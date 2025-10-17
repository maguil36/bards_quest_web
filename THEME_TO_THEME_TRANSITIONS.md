# Theme-to-Theme Transition Implementation

## Summary
The theme system has been enhanced to support transitions between any two specific themes (e.g., from "time" to "space"), not just from the default/original state to a specified theme.

## Changes Made

### 1. ThemeConfig Interface (src/components/ThemeConfig.astro)
- Added `originalTheme?: string` field to the `ThemeConfig` interface
- This optional field allows you to specify what theme to transition FROM
- Updated documentation with examples of theme-to-theme transitions

### 2. Theme Configuration Function (src/components/ThemeConfig.astro)
- Updated `getDefaultTheme()` function with example usage
- Page 7 of Chapter 1 now demonstrates a theme-to-theme transition from 'time' to 'space'
- Added additional examples in comments showing various transition scenarios

### 3. Reader Script (public/js/reader.js)
- Added logic to read the `data-original-theme` attribute
- Implemented theme-to-theme transition handling:
  - Temporarily sets the original theme without transition
  - Forces a reflow to ensure the original theme is applied
  - Restores the transition type and applies the new theme
  - Uses `requestAnimationFrame` to ensure smooth transitions

### 4. Page Template (src/pages/read/[id]/[page].astro)
- Extracts `originalTheme` from the theme configuration
- Passes it as `data-original-theme` attribute to the reader-root element

## Usage Examples

### Basic theme-to-theme transition:
```typescript
if (chapterId === 1 && pageNumber === 7) {
  return { 
    originalTheme: 'time', 
    theme: 'space', 
    transition: 'slow', 
    overrule: false 
  };
}
```

### With overrule (force the transition):
```typescript
if (chapterId === 2 && pageNumber === 10) {
  return { 
    originalTheme: 'hope', 
    theme: 'rage', 
    transition: 'fast', 
    overrule: true 
  };
}
```

### Instant theme change (no animation):
```typescript
if (chapterId === 3 && pageNumber === 5) {
  return { 
    originalTheme: 'light', 
    theme: 'void', 
    transition: 'instant', 
    overrule: false 
  };
}
```

## How It Works

1. **Configuration**: In `ThemeConfig.astro`, you specify both the `originalTheme` and the target `theme` for a page
2. **Data Flow**: The page template extracts this configuration and passes it to the reader via data attributes
3. **Transition Logic**: When the page loads, the reader script:
   - Checks if an `originalTheme` is specified
   - If yes, it first sets that theme instantly (no transition)
   - Then triggers a transition to the target theme using the specified transition type
4. **Result**: A smooth, animated transition from one specific theme to another

## Available Themes
- space, breath, light, time, heart, mind, hope, rage, life, doom, blood, void

## Available Transitions
- `smooth` (default): 2-second smooth ease-in-out transition
- `instant`: No transition, immediate theme change
- `fast`: 0.5-second quick transition
- `slow`: 4-second slow transition
- `fade`: 2-second fade with slight opacity change

## Notes
- The `originalTheme` field is optional - if not specified, the system works as before
- User preferences are still respected unless `overrule: true` is set
- The transition system works with all existing theme configurations
