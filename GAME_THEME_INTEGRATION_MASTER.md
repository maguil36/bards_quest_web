# Game Theme Integration Master Documentation

**Last Updated:** 2025
**Version:** 2.0

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Character-Theme Mapping](#character-theme-mapping)
4. [Implementation Flow](#implementation-flow)
5. [File Locations](#file-locations)
6. [Smooth Transitions](#smooth-transitions)
7. [Integration Examples](#integration-examples)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The game theme integration system allows games (particularly the Switch game) to dynamically change the parent page's theme based on the active character. This creates a cohesive visual experience where the comic page colors match the character you're controlling.

### Key Features

- **Dynamic Theme Changes**: Theme updates when switching characters in-game
- **Smooth Transitions**: Seamless color transitions without jarring flashes
- **User Preference Respect**: Only applies when user has "Default" theme selected
- **PostMessage Communication**: Secure iframe-to-parent messaging
- **Character-Specific Themes**: Each character maps to a specific theme

---

## Architecture

### Communication Flow

```
Game (iframe)
  ↓ (character switch)
characters.js (switchCharacter)
  ↓ (calls applyCharacterTheme)
game.js (applyCharacterTheme)
  ↓ (postMessage)
window.parent
  ↓ (message event)
MSPALayout.astro (event listener)
  ↓ (applies theme)
document.documentElement (data-theme attribute)
  ↓ (CSS responds)
Visual Theme Change
```

### Message Protocol

**Message Type:** `GAME_THEME_CHANGE`

**Payload:**
```javascript
{
  type: 'GAME_THEME_CHANGE',
  theme: 'breath' // or any valid theme name
}
```

---

## Character-Theme Mapping

### File: `public/games/switch/characters.js`

Character themes are defined in the character configuration:

```javascript
const CHARACTERS = {
  john: {
    id: 'john',
    name: 'John Egbert',
    theme: 'breath',
    // ... other properties
  },
  rose: {
    id: 'rose',
    name: 'Rose Lalonde',
    theme: 'light',
    // ... other properties
  },
  dave: {
    id: 'dave',
    name: 'Dave Strider',
    theme: 'time',
    // ... other properties
  },
  jade: {
    id: 'jade',
    name: 'Jade Harley',
    theme: 'space',
    // ... other properties
  },
  // ... more characters
};
```

### Default Character Themes

| Character | Theme | Color Scheme |
|-----------|-------|--------------|
| John Egbert | breath | Cyan/Blue |
| Rose Lalonde | light | Yellow/Gold |
| Dave Strider | time | Red/Orange |
| Jade Harley | space | Green |
| Jane Crocker | life | Pink |
| Dirk Strider | heart | Orange |
| Roxy Lalonde | void | Purple |
| Jake English | hope | Gold |
| Aradia Megido | time | Red |
| Tavros Nitram | breath | Brown/Orange |
| Sollux Captor | doom | Yellow/Red |
| Karkat Vantas | blood | Red |
| Nepeta Leijon | heart | Green |
| Kanaya Maryam | space | Jade Green |
| Terezi Pyrope | mind | Teal |
| Vriska Serket | light | Blue |
| Equius Zahhak | void | Blue |
| Gamzee Makara | rage | Purple |
| Eridan Ampora | hope | Purple/Violet |
| Feferi Peixes | life | Fuchsia |

---

## Implementation Flow

### 1. Character Switch in Game

**File:** `public/games/switch/characters.js` (line 284)

```javascript
switchCharacter(characterId) {
  if (!this.characters[characterId]) {
    console.error('Character not found:', characterId);
    return false;
  }
  
  this.activeCharacter = characterId;
  
  // Apply character theme to parent page
  this.applyCharacterTheme(characterId);
  
  return true;
}
```

### 2. Theme Application Function

**File:** `public/games/switch/game.js` (line 1344-1380)

```javascript
applyCharacterTheme(characterId) {
  const character = this.gameState.characters[characterId];
  if (!character || !character.theme) {
    console.warn('No theme found for character:', characterId);
    return;
  }
  
  const theme = character.theme;
  
  // Send message to parent window to change theme
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'GAME_THEME_CHANGE',
      theme: theme
    }, '*');
    
    console.log('Sent theme change to parent:', theme);
  }
}
```

### 3. Parent Page Listener

**File:** `src/layouts/MSPALayout.astro` (lines 48-92)

```javascript
window.addEventListener('message', (event) => {
  // Check if this is a theme change message from the game
  if (event.data && event.data.type === 'GAME_THEME_CHANGE') {
    const newTheme = event.data.theme;
    
    // Check user's theme preference from localStorage
    const themeKey = 'mspa:theme';
    let userTheme = null;
    try {
      userTheme = localStorage.getItem(themeKey);
    } catch (e) {
      // localStorage not available
    }
    
    // Only apply the game's theme if user has "default" or no preference
    if (!userTheme || userTheme === 'default') {
      // Get the current theme before changing
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'space';
      
      // Only transition if the theme is actually changing
      if (currentTheme !== newTheme) {
        // Step 1: Set transition to instant temporarily
        document.documentElement.setAttribute('data-transition', 'instant');
        
        // Step 2: Ensure current theme is applied
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // Step 3: Force a reflow to ensure the browser renders the current state
        void document.documentElement.offsetHeight;
        
        // Step 4: Restore smooth transition
        document.documentElement.setAttribute('data-transition', 'smooth');
        
        // Step 5: Use requestAnimationFrame to apply new theme on next frame
        requestAnimationFrame(() => {
          document.documentElement.setAttribute('data-theme', newTheme);
          console.log('Parent page theme smoothly transitioned to:', newTheme);
        });
      }
    }
  }
});
```

---

## File Locations

### Core Files

| File | Purpose | Key Lines |
|------|---------|-----------|
| `public/games/switch/characters.js` | Character definitions and theme mapping | 1-300 (character data), 284-295 (switchCharacter) |
| `public/games/switch/game.js` | Game logic and theme application | 881 (switchCharacter call), 1344-1380 (applyCharacterTheme) |
| `src/layouts/MSPALayout.astro` | Parent page theme listener | 48-92 (message event listener) |
| `src/pages/games/switch.astro` | Game page template | (entire file) |

### Supporting Files

| File | Purpose |
|------|---------|
| `public/styles.css` | Theme color definitions |
| `src/components/ThemeConfig.astro` | Theme configuration system |

---

## Smooth Transitions

### The Problem

Without proper handling, theme changes can cause:
- **Jarring flashes** of color
- **Abrupt transitions** that feel unpolished
- **Visual glitches** during rapid character switching

### The Solution

The system uses a **5-step transition process** to ensure smooth theme changes:

#### Step 1: Set Instant Transition
```javascript
document.documentElement.setAttribute('data-transition', 'instant');
```
Temporarily disables transitions to lock in the current state.

#### Step 2: Apply Current Theme
```javascript
document.documentElement.setAttribute('data-theme', currentTheme);
```
Ensures the browser has the current theme fully rendered.

#### Step 3: Force Reflow
```javascript
void document.documentElement.offsetHeight;
```
Forces the browser to render the current state before proceeding.

#### Step 4: Restore Smooth Transition
```javascript
document.documentElement.setAttribute('data-transition', 'smooth');
```
Re-enables smooth transitions for the upcoming change.

#### Step 5: Apply New Theme
```javascript
requestAnimationFrame(() => {
  document.documentElement.setAttribute('data-theme', newTheme);
});
```
Applies the new theme on the next animation frame, triggering a smooth transition.

### Why This Works

1. **Instant lock-in** prevents the browser from transitioning FROM an unknown state
2. **Forced reflow** ensures the current state is fully rendered
3. **requestAnimationFrame** ensures the new theme is applied on a fresh frame
4. **Smooth transition** creates a polished visual effect

---

## Integration Examples

### Example 1: Adding a New Character with Theme

**Goal:** Add a new character "Calliope" with the "space" theme.

**Edit `public/games/switch/characters.js`:**

```javascript
const CHARACTERS = {
  // ... existing characters ...
  
  calliope: {
    id: 'calliope',
    name: 'Calliope',
    theme: 'space',
    sprite: 'calliope.png',
    // ... other properties
  }
};
```

The theme will automatically apply when the player switches to Calliope.

### Example 2: Changing a Character's Theme

**Goal:** Change Dave's theme from "time" to "heart".

**Edit `public/games/switch/characters.js`:**

```javascript
dave: {
  id: 'dave',
  name: 'Dave Strider',
  theme: 'heart', // Changed from 'time'
  // ... other properties
}
```

### Example 3: Testing Theme Changes

**In Browser Console (while playing the game):**

```javascript
// Manually trigger a theme change
window.parent.postMessage({
  type: 'GAME_THEME_CHANGE',
  theme: 'rage'
}, '*');
```

### Example 4: Disabling Game Theme Changes

**Goal:** Prevent the game from changing themes (user wants consistent colors).

**User Action:** Go to `/options` and select any theme other than "Default".

**Result:** The game will still send theme change messages, but the parent page will ignore them.

---

## User Preference Behavior

### When User Selects "Default"

- ✅ Game theme changes are applied
- ✅ Themes change dynamically with character switches
- ✅ Smooth transitions between themes

### When User Selects "Space"

- ❌ Game theme changes are ignored
- ✅ Page always uses space theme (no colors)
- ✅ Consistent visual experience

### When User Selects a Specific Theme (e.g., "Breath")

- ❌ Game theme changes are ignored
- ✅ Page always uses the selected theme
- ✅ User's preference is respected

### When Page Has `overrule: true`

- ❌ Game theme changes are ignored
- ❌ User preferences are ignored
- ✅ Page's forced theme is always used

---

## Advanced Features

### Initial Theme on Game Load

When a game page loads, it can set an initial theme based on the starting character:

**File:** `public/games/switch/game.js` (initialization)

```javascript
// On game initialization
const startingCharacter = 'john'; // or from save data
this.gameState.switchCharacter(startingCharacter);
```

This ensures the page theme matches the character from the moment the game loads.

### Theme Persistence Across Game Sessions

The game can save the active character and restore it on reload:

```javascript
// Save active character
localStorage.setItem('switch-game:active-character', this.activeCharacter);

// Restore on load
const savedCharacter = localStorage.getItem('switch-game:active-character');
if (savedCharacter) {
  this.gameState.switchCharacter(savedCharacter);
}
```

### Handling Multiple Games

If you have multiple games with different theme systems:

1. **Use consistent message types** - All games should use `GAME_THEME_CHANGE`
2. **Validate theme names** - Ensure themes exist in your CSS
3. **Test cross-game navigation** - Verify themes reset properly

---

## Troubleshooting

### Theme Not Changing When Switching Characters

**Possible Causes:**

1. **User has a specific theme selected**
   - Solution: Go to `/options` and select "Default"

2. **Character doesn't have a theme defined**
   - Solution: Add `theme` property to character in `characters.js`

3. **PostMessage not reaching parent**
   - Solution: Check browser console for errors
   - Verify game is in an iframe

4. **Page has `overrule: true`**
   - Solution: This is intentional; page theme is forced

### Transitions Are Jarring or Flashy

**Possible Causes:**

1. **Smooth transition logic not working**
   - Solution: Check `MSPALayout.astro` has the 5-step transition code

2. **CSS transitions not defined**
   - Solution: Verify `public/styles.css` has transition definitions

3. **Browser performance issues**
   - Solution: Test on different browsers/devices

### Theme Changes But Colors Are Wrong

**Possible Causes:**

1. **Theme name mismatch**
   - Solution: Verify character theme matches CSS theme name exactly

2. **CSS not loaded**
   - Solution: Check network tab for `public/styles.css`

3. **CSS specificity issues**
   - Solution: Inspect element and check computed styles

### Console Errors

**"Character not found"**
- Character ID doesn't exist in `CHARACTERS` object
- Check spelling and case sensitivity

**"No theme found for character"**
- Character object missing `theme` property
- Add theme to character definition

**"Could not save theme preference"**
- localStorage is disabled (private browsing)
- This is expected behavior; theme will still work for current session

---

## Best Practices

1. **Always define themes for characters** - Prevents fallback to space theme
2. **Test with different user preferences** - Ensure game works in all scenarios
3. **Use consistent theme names** - Match CSS theme definitions exactly
4. **Log theme changes during development** - Use `console.log` to debug
5. **Handle edge cases** - What if character has no theme? Default to space.
6. **Respect user preferences** - Don't force themes unless story-critical

---

## Performance Considerations

### Message Frequency

- **Throttle theme changes** if switching characters rapidly
- **Debounce** if user is clicking through characters quickly
- **Skip redundant messages** if theme hasn't changed

### CSS Performance

- **Use CSS custom properties** for theme colors (already implemented)
- **Minimize transition properties** - Only transition what's necessary
- **Test on low-end devices** - Ensure smooth performance

### CSS File Reference

- **Theme definitions** are located in `public/styles.css`
- **All theme color variables** are defined in this single file
- **No separate themes.css file** - Use `public/styles.css` for all theme-related styles

### Memory Management

- **Remove event listeners** when game is destroyed
- **Clean up postMessage handlers** if game is reloaded
- **Avoid memory leaks** in long game sessions

---

## Game Mechanics & Character Switching

### Starting Character

The Switch game starts with **Opal** as the initial character:

**File:** `public/games/switch/characters.js`

```javascript
// In GameState constructor
this.currentCharacter = 'opal';
this.unlockedCharacters = new Set(['opal']);
```

**Impact:**
- Players begin the game as Opal
- Initial theme is "Space" (Opal's theme)
- Starting position is Opal's default position (x: 300, y: 500)

### Character Switching Restrictions

**Switch Requirement:** Players can only switch characters when **"Remaining to progress: 0"** (all required dialogues completed for current character).

**File:** `public/games/switch/game.js` - `showSwitchPrompt()` function

```javascript
showSwitchPrompt() {
    const currentChar = this.gameState.getCurrentCharacter();

    // Check if current character has completed all required dialogues
    const remainingForCharacter = (this.gameState && typeof this.gameState.getRemainingForCharacterProgress === 'function')
        ? this.gameState.getRemainingForCharacterProgress(currentChar.id)
        : 1;

    // Only allow switching if remaining = 0
    if (remainingForCharacter > 0) {
        return; // Don't show switch prompt
    }

    // ... rest of logic
}
```

**Impact:**
- Switch prompt only appears after completing all required conversations
- Prevents premature character switching
- Ensures players complete each character's dialogue requirements

### Victor (Final Character) Special Rules

Victor has additional unlock criteria beyond the standard switching requirements:

**Unlock Criteria:**
1. All 42 required interactions must be completed (remaining == 0)
2. Current character must have spoken to Victor
3. The last interaction must be with Victor
4. Only then will the switch prompt appear, offering to switch TO Victor

**Bug Fix:** Prevents switch prompt from appearing when talking to Victor unless his unlock criteria are met:

```javascript
// If we just talked to Victor but unlock criteria aren't met, don't show prompt
if (lastTalked === 'victor') {
    if (!(remaining === 0 && spokeVictor && this.gameState.canSwitchToCharacter && this.gameState.canSwitchToCharacter('victor'))) {
        return; // Don't show switch prompt
    }
}
```

### Game Flow Summary

1. **Start as Opal** with Space theme
2. **Complete all required dialogues** for current character (Remaining to progress: 0)
3. **Switch prompt appears** after last required dialogue
4. **Switch to new character** - theme changes to match new character (if user has "Default" selected)
5. **Repeat** for each character
6. **Victor unlocks** only after all 42 interactions are complete

---

## Future Enhancements

### Potential Features

1. **Theme preview in character select** - Show theme colors before switching
2. **Custom transition types per character** - Some characters could have unique transitions
3. **Theme mixing** - Blend themes for multi-character scenarios
4. **Animated theme transitions** - More complex visual effects
5. **Theme-based sound effects** - Audio cues for theme changes

---

## Related Documentation

- **THEME_SYSTEM_MASTER.md** - Complete theme system documentation
- **src/components/ThemeConfig.astro** - Theme configuration
- **public/games/switch/README.md** - Switch game documentation (if exists)

---

## Quick Reference

### Adding a Character Theme

1. Open `public/games/switch/characters.js`
2. Find or add character object
3. Add `theme: 'themename'` property
4. Save and test

### Testing Theme Changes

1. Open game page
2. Open browser console
3. Switch characters in game
4. Watch console logs for "Sent theme change to parent"
5. Verify parent page logs "Parent page theme smoothly transitioned to"

### Debugging Checklist

- [ ] Character has `theme` property defined
- [ ] User has "Default" theme selected in `/options`
- [ ] Page doesn't have `overrule: true`
- [ ] Browser console shows no errors
- [ ] `themes.css` is loaded
- [ ] Game is in an iframe (for postMessage to work)

---

**End of Game Theme Integration Master Documentation**
