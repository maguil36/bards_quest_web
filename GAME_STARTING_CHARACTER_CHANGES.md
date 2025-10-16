# Game Starting Character and Switch Restriction Changes

## Summary

Modified the Switch game to:
1. Start with **Opal** as the initial character (instead of Alexis)
2. Only allow character switching when **"Remaining to progress: 0"** (all required dialogues completed for current character)
3. **Fixed bug:** Prevent switch prompt from appearing when talking to Victor unless his specific unlock criteria are met

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

### 3. Victor Switch Prompt Bug Fix
**File:** `public/games/switch/game.js`

Added a check to prevent the switch prompt from appearing when talking to Victor unless his unlock criteria are met:

```javascript
// NEW: If we just talked to Victor but the unlock criteria aren't met, don't show any prompt
if (lastTalked === 'victor') {
    // Only show prompt if Victor's unlock criteria are fully met
    if (!(remaining === 0 && spokeVictor && this.gameState.canSwitchToCharacter && this.gameState.canSwitchToCharacter('victor'))) {
        return; // Don't show switch prompt when talking to Victor unless unlock criteria met
    }
}
```

**Bug Description:**
- Previously, when talking to Victor, the game would show a switch prompt to switch to another character (the last non-final NPC talked to)
- This was incorrect behavior - no switch prompt should appear when talking to Victor unless his specific unlock criteria are met

**Fix:**
- Added an early return check that detects if the last NPC talked to was Victor
- If Victor's unlock criteria aren't met (game complete AND spoken to Victor as current character), the function returns without showing any prompt
- This ensures Victor conversations don't trigger inappropriate switch prompts

**Victor's Unlock Criteria:**
- All 42 required interactions must be completed (remaining == 0)
- Current character must have spoken to Victor
- The last interaction must be with Victor
- Only then will the switch prompt appear, offering to switch TO Victor

## Game Flow

### Before Changes
1. Start as Alexis
2. Could switch after any dialogue completion (if conditions met)
3. Talking to Victor would show switch prompt to other characters (BUG)

### After Changes
1. Start as Opal
2. Must complete ALL required dialogues for current character before switching
3. "Remaining to progress: 0" is required to see the switch prompt
4. Talking to Victor shows NO switch prompt unless his unlock criteria are met

## Testing Checklist

- [ ] Start a new game and verify you begin as Opal
- [ ] Verify the theme starts as "Space" (Opal's theme)
- [ ] Talk to some NPCs but not all required ones
- [ ] Verify switch prompt does NOT appear (Remaining to progress > 0)
- [ ] Complete all required dialogues for Opal (Remaining to progress: 0)
- [ ] Verify switch prompt DOES appear after completing the last required dialogue
- [ ] Switch to another character and repeat the process
- [ ] **NEW:** Talk to Victor before completing all 42 interactions
- [ ] **NEW:** Verify NO switch prompt appears when talking to Victor (before unlock)
- [ ] **NEW:** Complete all 42 interactions and talk to Victor as current character
- [ ] **NEW:** Verify switch prompt DOES appear, offering to switch TO Victor

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
- **Bug fix ensures Victor conversations don't trigger inappropriate switch prompts**
