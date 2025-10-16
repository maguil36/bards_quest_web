# Game Starting Character and Switch Restriction Changes

## Summary

Modified the Switch game to:
1. Start with **Opal** as the initial character (instead of Alexis)
2. Only allow character switching when **"Remaining to progress: 0"** (all required dialogues completed for current character)

## Changes Made

### 1. Starting Character Change
**File:** `public/games/switch/characters.js`

Changed the initial character in the `GameState` constructor:
```javascript
// Before:
this.currentCharacter = 'alexis';
this.unlockedCharacters = new Set(['alexis']);

// After:
this.currentCharacter = 'opal';
this.unlockedCharacters = new Set(['opal']);
```

**Impact:**
- Players now start the game as Opal
- Initial theme is "Space" (Opal's theme)
- Starting position is Opal's default position (x: 300, y: 500)

### 2. Switch Restriction
**File:** `public/games/switch/game.js`

Modified the `showSwitchPrompt()` function to check if the current character has completed all required dialogues:

```javascript
showSwitchPrompt() {
    const currentChar = this.gameState.getCurrentCharacter();

    // Check if current character has completed all required dialogues (Remaining to progress: 0)
    const remainingForCharacter = (this.gameState && typeof this.gameState.getRemainingForCharacterProgress === 'function')
        ? this.gameState.getRemainingForCharacterProgress(currentChar.id)
        : 1;
    
    // Only allow switching if the current character has talked to everyone they need to (remaining = 0)
    if (remainingForCharacter > 0) {
        return; // Don't show switch prompt if character hasn't completed all dialogues
    }

    // ... rest of the existing logic
}
```

**Impact:**
- Switch prompt only appears after completing all required conversations for the current character
- "Remaining to progress" must be 0 before switching is allowed
- Prevents premature character switching
- Ensures players complete each character's dialogue requirements

## Game Flow

### Before Changes
1. Start as Alexis
2. Could switch after any dialogue completion (if conditions met)

### After Changes
1. Start as Opal
2. Must complete ALL required dialogues for current character before switching
3. "Remaining to progress: 0" is required to see the switch prompt

## Testing Checklist

- [ ] Start a new game and verify you begin as Opal
- [ ] Verify the theme starts as "Space" (Opal's theme)
- [ ] Talk to some NPCs but not all required ones
- [ ] Verify switch prompt does NOT appear (Remaining to progress > 0)
- [ ] Complete all required dialogues for Opal (Remaining to progress: 0)
- [ ] Verify switch prompt DOES appear after completing the last required dialogue
- [ ] Switch to another character and repeat the process

## Related Files

- `public/games/switch/characters.js` - Character definitions and GameState
- `public/games/switch/game.js` - Main game logic and switch prompt
- `GAME_THEME_INTEGRATION.md` - Theme integration documentation
- `IMPLEMENTATION_SUMMARY.md` - Previous implementation summary

## Build Status

✅ Build completed successfully with no errors

## Notes

- The change is backward compatible with existing save data
- Players with existing saves will continue from their current character
- New games will start with Opal
- The restriction applies to all characters equally
- Victor (final character) still has special unlock requirements on top of this restriction
