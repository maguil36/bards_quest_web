# Theme System Quick Reference

## Quick Start

Edit `src/components/ThemeConfig.astro` to set page themes:

```javascript
export function getDefaultTheme(chapterId: number, pageNumber: number): ThemeConfig | null {
  // Normal theme (user can override)
  if (chapterId === 1 && pageNumber === 1) {
    return { theme: 'breath', overrule: false };
  }
  
  // Forced theme (user CANNOT override)
  if (chapterId === 2 && pageNumber === 15) {
    return { theme: 'rage', overrule: true };
  }
  
  return null; // No default theme
}
```

## User Options

In `/options`, users can select:

| Option | Behavior |
|--------|----------|
| **Default (Page-Specific)** | Uses themes you define in ThemeConfig. Falls back to space if no theme defined. In games, themes change with active character. |
| **Space** | Always space theme (no colors), ignores page defaults and game characters (unless overrule: true). |
| **Breath, Light, Time, etc.** | Always uses that theme, ignores page defaults and game characters (unless overrule: true). |

## Theme Priority

### Normal Pages (overrule: false)
1. User's chosen theme (if not "Default")
2. Page-specific theme (if user chose "Default")
3. Space theme (fallback)

### Forced Pages (overrule: true)
1. **Page theme ALWAYS wins** - ignores all user preferences

### Game Pages (when "Default" selected)
1. **Character theme changes dynamically** - switches with active character
2. If user selected specific theme - that theme is maintained

## Common Patterns

### Single Page
```javascript
if (chapterId === 1 && pageNumber === 1) {
  return { theme: 'breath' }; // overrule defaults to false
}
```

### Range
```javascript
if (chapterId === 2 && pageNumber >= 5 && pageNumber <= 10) {
  return { theme: 'mind', overrule: false };
}
```

### Forced Theme
```javascript
if (chapterId === 3 && pageNumber === 1) {
  return { theme: 'rage', overrule: true }; // ALWAYS rage
}
```

### Entire Chapter
```javascript
if (chapterId === 4) {
  return { theme: 'doom' };
}
```

## Available Themes

`space` • `breath` • `light` • `time` • `heart` • `mind` • `hope` • `rage` • `life` • `doom` • `blood` • `void`

## When to Use overrule: true

✅ **Use for:**
- Dramatic story moments
- Character introductions
- Plot twists
- Climactic scenes
- Flashbacks/dream sequences

❌ **Don't use for:**
- Regular pages
- Entire chapters (unless story-critical)
- Personal preference

## Testing

1. Visit `/options` and select "Default (Page-Specific)"
2. Navigate to a page with a defined theme
3. See the theme applied
4. Try selecting "Space" - page themes are ignored (unless overrule: true)
5. Try selecting "Breath" - all pages use breath (unless overrule: true)

## Files to Edit

- **`src/components/ThemeConfig.astro`** - Define your page themes here
- That's it! Everything else is automatic.

## Example: Story Arc

```javascript
export function getDefaultTheme(chapterId: number, pageNumber: number): ThemeConfig | null {
  // Chapter 1: Introduction (normal themes)
  if (chapterId === 1) {
    if (pageNumber === 1) return { theme: 'breath' }; // Opening
    if (pageNumber >= 10 && pageNumber <= 15) return { theme: 'light' }; // Happy moment
  }
  
  // Chapter 2: Rising tension
  if (chapterId === 2) {
    if (pageNumber >= 1 && pageNumber <= 10) return { theme: 'time' }; // Building tension
    if (pageNumber === 15) return { theme: 'rage', overrule: true }; // CLIMAX - forced!
    if (pageNumber >= 16) return { theme: 'void' }; // Aftermath
  }
  
  // Chapter 3: Resolution
  if (chapterId === 3) {
    if (pageNumber === 1) return { theme: 'hope', overrule: true }; // New beginning - forced!
    if (pageNumber >= 5) return { theme: 'breath' }; // Back to normal
  }
  
  return null;
}
```

## Troubleshooting

**Theme not showing?**
- Check if user has selected a specific theme in Options
- Check if the page has `overrule: false` (default)
- User preferences override normal page themes

**Theme showing when it shouldn't?**
- Check if page has `overrule: true`
- Forced themes ignore all user preferences

**Want consistent theme throughout?**
- User should select a specific theme (not "Default")
- Or set `overrule: true` on pages that must have specific themes
