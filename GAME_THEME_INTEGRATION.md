# Game Theme Integration

## Overview

The Switch game dynamically changes the comic background theme based on the active character when the user has selected "Default" theme in options.

## How It Works

### Character Theme Mapping

Each character in the game is mapped to a specific theme:

| Character | Theme |
|-----------|-------|
| Alexis | Rage |
| Austine | Mind |
| Chloe | Life |
| Isabell | Blood |
| Nicholas | Light |
| Opal | Space |
| Tyson | Doom |
| Victor | Time |

### Theme Application Logic

The game checks the user's theme preference before applying character themes:

1. **User selects "Default"** → Character themes are applied dynamically as you switch characters
2. **User selects "Space"** → Space theme is maintained throughout the game
3. **User selects any specific theme** → That theme is maintained throughout the game

### User Experience

#### With "Default" Theme Selected
- Start as Alexis → Background uses Rage theme (red)
- Switch to Victor → Background changes to Time theme (orange)
- Switch to Opal → Background changes to Space theme (default/no colors)
- Switch to Chloe → Background changes to Life theme (green)
- And so on...

#### With Specific Theme Selected (e.g., "Breath")
- Start as Alexis → Background uses Breath theme
- Switch to Victor → Background stays Breath theme
- Switch to any character → Background stays Breath theme
- User's preference is respected throughout

#### With "Space" Theme Selected
- All characters use Space theme (no colors)
- Consistent classic look throughout the game

### Character UI Accent

Regardless of the background theme setting, the UI accent color (buttons, highlights, etc.) always matches the current character's color. This provides visual feedback about which character you're controlling even when using a fixed theme.

## Technical Implementation

### Files Modified

**`public/games/switch/game.js`** - `applyCharacterTheme()` method:
```javascript
applyCharacterTheme(character) {
    // Character to theme mapping
    const THEME_BY_CHAR = {
        alexis: 'rage',
        austine: 'mind',
        chloe: 'life',
        isabell: 'blood',
        nicholas: 'light',
        opal: 'space',
        tyson: 'doom',
        victor: 'time',
    };
    
    // Check user's theme preference
    const userTheme = localStorage.getItem('mspa:theme');
    
    // Only apply character theme if user wants default behavior
    if (!userTheme || userTheme === 'default') {
        const theme = THEME_BY_CHAR[character.id] || 'space';
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    // Always update UI accent to match character
    document.documentElement.style.setProperty('--accent', character.color);
}
```

### When Theme Changes Occur

Character themes are applied:
1. **On game initialization** - Sets theme for starting character
2. **On character switch** - Updates theme when switching to a new character
3. **On first user interaction** - Reapplies theme after CSS loads

### Integration with Main Theme System

The game respects the same theme preference system as the rest of the site:
- Reads from `localStorage` key: `mspa:theme`
- Checks for values: `null`, `'default'`, `'space'`, or specific theme names
- Applies character themes only when appropriate

## Customization

### Changing Character Theme Mappings

Edit the `THEME_BY_CHAR` object in `public/games/switch/game.js`:

```javascript
const THEME_BY_CHAR = {
    alexis: 'rage',      // Change to any theme
    austine: 'mind',     // breath, light, time, etc.
    chloe: 'life',
    isabell: 'blood',
    nicholas: 'light',
    opal: 'space',
    tyson: 'doom',
    victor: 'time',
};
```

### Adding New Characters

When adding new characters:
1. Add character definition in `characters.js`
2. Add theme mapping in `THEME_BY_CHAR` in `game.js`
3. Character will automatically get theme switching

## Testing

### Test Default Theme Behavior
1. Go to `/options`
2. Select "Default (Page-Specific)"
3. Navigate to a page with the Switch game
4. Play the game and switch characters
5. Observe background theme changing with each character

### Test Fixed Theme Behavior
1. Go to `/options`
2. Select "Breath" (or any specific theme)
3. Navigate to a page with the Switch game
4. Play the game and switch characters
5. Observe background theme staying as Breath throughout

### Test Space Theme Behavior
1. Go to `/options`
2. Select "Space"
3. Navigate to a page with the Switch game
4. Play the game and switch characters
5. Observe background staying as Space (no colors) throughout

## Benefits

1. **Enhanced Immersion** - Background reflects current character's personality
2. **Visual Feedback** - Clear indication of which character you're controlling
3. **User Control** - Users can opt for consistent themes if they prefer
4. **Seamless Integration** - Works with existing theme system
5. **Accessibility** - Users who prefer consistent themes can disable dynamic switching

## Future Enhancements

Possible future additions:
- Transition animations between theme changes
- Character-specific background images
- Theme-based sound effects on character switch
- Per-character UI layouts or styles
