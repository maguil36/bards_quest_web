# Default Theme System

This project includes a sophisticated theme system that allows you to assign specific themes to individual comic pages, with the ability to force themes for story-critical moments.

## How It Works

1. **Default Themes**: Pages can have default themes defined in `src/components/ThemeConfig.astro`
2. **User Preferences**: Users can choose themes in Options
3. **Overrule Mode**: Pages can force their theme, ignoring user preferences (for dramatic moments)
4. **Fallback**: If nothing is set, pages use the 'space' theme
5. **Game Integration**: The Switch game dynamically changes themes based on active character (when "Default" is selected)

## Theme Options in Settings

Users can select from these options in `/options`:

- **Default (Page-Specific)**: Uses the theme defined for each page. If no theme is defined, uses space. In games, themes change based on active character.
- **Space**: Always uses the space theme (no colors), regardless of page defaults or game character.
- **Breath, Light, Time, etc.**: Always uses the selected theme, overriding page defaults and game character themes (unless a page has `overrule: true`).

## Priority Order

### Normal Pages (overrule: false)
1. User's specific theme choice (breath, light, time, etc.) - **highest priority**
2. Page-specific default theme (if user selected "Default")
3. Space theme - **lowest priority / fallback**

### Forced Pages (overrule: true)
1. Page's forced theme - **ALWAYS USED, ignores all user preferences**

### Game Pages (when "Default" is selected)
1. Active character's theme - **changes dynamically as you switch characters**
2. If user selected a specific theme - **that theme is maintained throughout**

## Setting Default Themes

Edit the `getDefaultTheme()` function in `src/components/ThemeConfig.astro`:

```javascript
export function getDefaultTheme(chapterId: number, pageNumber: number): ThemeConfig | null {
  // Normal page theme (can be overridden by user)
  if (chapterId === 1 && pageNumber === 1) {
    return { theme: 'breath', overrule: false };
  }
  
  // Forced page theme (ALWAYS used, ignores user preferences)
  if (chapterId === 2 && pageNumber === 15) {
    return { theme: 'rage', overrule: true };
  }
  
  // Shorthand (defaults to overrule: false)
  if (chapterId === 3 && pageNumber === 5) {
    return { theme: 'hope' };
  }
  
  // Return null for no default theme
  return null;
}
```

## Available Themes

- `space` (default, no colors)
- `breath`
- `light`
- `time`
- `heart`
- `mind`
- `hope`
- `rage`
- `life`
- `doom`
- `blood`
- `void`

## Examples

### Normal Page Theme (Respects User Preferences)
```javascript
// User can override this by selecting a different theme in options
if (chapterId === 1 && pageNumber === 1) {
  return { theme: 'breath', overrule: false };
}
```

### Forced Page Theme (Ignores User Preferences)
```javascript
// This page will ALWAYS be rage theme, no matter what the user selected
if (chapterId === 2 && pageNumber === 15) {
  return { theme: 'rage', overrule: true };
}
```

### Range of Pages
```javascript
if (chapterId === 2 && pageNumber >= 5 && pageNumber <= 10) {
  return { theme: 'mind', overrule: false };
}
```

### Multiple Pages in a Chapter
```javascript
if (chapterId === 3) {
  // Opening scene - forced theme for dramatic effect
  if (pageNumber === 1) return { theme: 'hope', overrule: true };
  
  // Middle section - user can override
  if (pageNumber >= 5 && pageNumber <= 10) return { theme: 'light' };
  
  // Climax - forced theme
  if (pageNumber === 15) return { theme: 'rage', overrule: true };
}
```

### Entire Chapter
```javascript
// All pages in chapter 4 use doom theme (unless user overrides)
if (chapterId === 4) {
  return { theme: 'doom', overrule: false };
}
```

### Complex Logic
```javascript
if (chapterId === 5) {
  // Even pages use light theme
  if (pageNumber % 2 === 0) return { theme: 'light' };
  // Odd pages use void theme
  return { theme: 'void' };
}
```

## Game Theme Integration

The Switch game includes dynamic theme switching based on the active character. See `GAME_THEME_INTEGRATION.md` for details.

### Character Theme Mapping
- **Alexis** → Rage
- **Austine** → Mind
- **Chloe** → Life
- **Isabell** → Blood
- **Nicholas** → Light
- **Opal** → Space
- **Tyson** → Doom
- **Victor** → Time

### How It Works in Games
- **User selects "Default"**: Background theme changes as you switch characters
- **User selects "Space"**: Background stays space throughout the game
- **User selects specific theme**: Background stays that theme throughout the game
- **UI accent color**: Always matches the current character (regardless of theme setting)

## User Experience

### When User Selects "Default"
- Pages with defined themes use those themes
- Pages without defined themes use space
- Game pages change themes based on active character
- Creates a dynamic reading experience with contextual themes

### When User Selects "Space"
- All pages use space theme (no colors)
- Ignores all page-specific themes (unless `overrule: true`)
- Game maintains space theme regardless of character
- Classic, consistent look throughout

### When User Selects a Specific Theme (e.g., "Breath")
- All pages use the selected theme
- Overrides page-specific themes (unless `overrule: true`)
- Game maintains the selected theme regardless of character
- Consistent themed experience

### When a Page Has overrule: true
- The page's theme is ALWAYS used
- User preferences are completely ignored
- Perfect for story-critical moments, dramatic reveals, or important scenes

## Use Cases for Overrule

Use `overrule: true` for:
- **Dramatic moments**: Force a specific mood/atmosphere
- **Character introductions**: Each character gets their signature theme
- **Plot twists**: Sudden theme change for impact
- **Climactic scenes**: Ensure the right emotional tone
- **Flashbacks**: Different theme to distinguish from present
- **Dream sequences**: Unique theme for surreal moments

## Files Modified

- `src/components/ThemeConfig.astro` - Theme configuration with overrule support
- `src/pages/read/[id]/[page].astro` - Passes theme config and overrule flag
- `public/js/reader.js` - Implements theme logic with overrule
- `public/js/options.js` - Handles "Default" vs "Space" distinction
- `src/pages/options.astro` - Updated UI with "Default" option
- `public/games/switch/game.js` - Game theme integration with character switching

## Technical Details

The system uses three data attributes on the reader element:
- `data-default-theme`: The theme name (if any)
- `data-overrule-theme`: "1" if theme should be forced, "0" otherwise
- User preference stored in `localStorage` under `mspa:theme`

The theme resolution logic:
1. Check if `overrule: true` → use page theme
2. Check user preference:
   - `null` or `"default"` → use page theme or space (or character theme in games)
   - `"space"` → always use space
   - Other → use user's chosen theme
3. Apply theme to `document.documentElement.data-theme`

## Related Documentation

- `THEME_QUICK_REFERENCE.md` - Quick reference guide for common patterns
- `GAME_THEME_INTEGRATION.md` - Detailed documentation on game theme integration
